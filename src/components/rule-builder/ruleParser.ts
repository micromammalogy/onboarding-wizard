/**
 * Parses existing rule expressions back into StructuredRule for editing.
 *
 * Handles:
 * - Splitting condition by and/or
 * - Extracting :variable: tokens
 * - Parsing operators and values
 * - Splitting actions array
 * - Detecting operation type from expression shape
 */

import type {
  IRuleCondition,
  IRuleAction,
  IConditionOperator,
  IConditionConnector,
  IActionOperation,
  IStructuredRule,
  IRuleFromAPI,
} from './types';

/** Operators ordered longest-first to avoid partial matches */
const OPERATORS: IConditionOperator[] = [
  'any_contains',
  '>=',
  '<=',
  '!=',
  '==',
  '>',
  '<',
];

/**
 * The RuleDgs parser accepts both symbolic (==, !=, >, <, >=, <=)
 * and word-based (eq, ne, gt, lt, ge, le, contains) operators.
 * Map word-based → symbolic for internal consistency.
 */
const WORD_OPERATOR_MAP: Record<string, IConditionOperator> = {
  eq: '==',
  ne: '!=',
  gt: '>',
  lt: '<',
  ge: '>=',
  le: '<=',
  contains: 'any_contains',
  any_contains: 'any_contains',
  any_eq: '==',
  any_ne: '!=',
};

const VARIABLE_REGEX = /:([a-zA-Z_][a-zA-Z0-9_]*):/g;

/**
 * Extract the variable name from a `:variable:` token.
 */
function extractVariable(token: string): string {
  const match = token.match(/^:(.+):$/);
  return match ? match[1] : token;
}

/**
 * Parse a condition string into an array of RuleConditions.
 *
 * Input: ":ship_to_country: == US and :carrier: == ups"
 * Output: [
 *   { variable: "ship_to_country", operator: "==", value: "US", connector: "and" },
 *   { variable: "carrier", operator: "==", value: "ups", connector: "and" }
 * ]
 */
export function parseConditionString(condition: string): IRuleCondition[] {
  if (!condition.trim()) return [];

  // Split by 'and' / 'or' while preserving the connector
  // We need to be careful not to split inside quoted strings
  const parts = splitByConnectors(condition);

  return parts.map(({ fragment, connector }) => {
    const parsed = parseConditionFragment(fragment.trim());
    return {
      id: crypto.randomUUID(),
      variable: parsed.variable,
      operator: parsed.operator,
      value: parsed.value,
      connector,
    };
  });
}

type IConditionPart = {
  fragment: string;
  connector: IConditionConnector;
};

/**
 * Split a condition string by 'and' / 'or' connectors.
 * Preserves the connector that follows each fragment.
 */
function splitByConnectors(condition: string): IConditionPart[] {
  const results: IConditionPart[] = [];
  // Match ' and ' or ' or ' as delimiters (word-boundary aware)
  const regex = /\s+(and|or)\s+/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(condition)) !== null) {
    const fragment = condition.slice(lastIndex, match.index);
    const connector = match[1].toLowerCase() as IConditionConnector;
    results.push({ fragment, connector });
    lastIndex = match.index + match[0].length;
  }

  // Last fragment
  const remaining = condition.slice(lastIndex);
  if (remaining.trim()) {
    results.push({ fragment: remaining, connector: 'and' });
  }

  return results;
}

/**
 * Parse a single condition fragment: `:variable: operator value`
 */
function parseConditionFragment(fragment: string): {
  variable: string;
  operator: IConditionOperator;
  value: string;
} {
  // Find the variable token
  const varMatch = fragment.match(/:([a-zA-Z_][a-zA-Z0-9_]*):/);
  const variable = varMatch ? varMatch[1] : '';

  // Remove variable from the fragment to find operator + value
  const afterVar = fragment.replace(/:([a-zA-Z_][a-zA-Z0-9_]*):/, '').trim();

  // Find the operator — check symbolic operators first, then word-based
  let operator: IConditionOperator = '==';
  let value = afterVar;
  let matched = false;

  for (const op of OPERATORS) {
    if (afterVar.startsWith(op + ' ') || afterVar === op) {
      operator = op;
      value = afterVar.slice(op.length).trim();
      matched = true;
      break;
    }
  }

  // Check word-based operators if no symbolic match
  if (!matched) {
    for (const [word, op] of Object.entries(WORD_OPERATOR_MAP)) {
      if (afterVar.startsWith(word + ' ') || afterVar === word) {
        operator = op;
        value = afterVar.slice(word.length).trim();
        break;
      }
    }
  }

  // Remove surrounding quotes from value
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { variable, operator, value };
}

/**
 * Parse a single action expression into a RuleAction.
 *
 * Patterns:
 * - `:amount: = 5 USD`           → set, value=5, currency=USD
 * - `:amount: = :amount: + 5`    → add, value=5
 * - `:amount: = :amount: - 5`    → subtract, value=5
 * - `:amount: = :amount: * 1.1`  → multiply, value=1.1
 * - `:enabled: = false`          → set, value=false
 */
export function parseActionExpression(expression: string): IRuleAction {
  const trimmed = expression.trim();

  // Extract left-hand variable
  const lhsMatch = trimmed.match(/^:([a-zA-Z_][a-zA-Z0-9_]*):/);
  const variable = lhsMatch ? lhsMatch[1] : '';

  // Get everything after the '='
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) {
    return {
      id: crypto.randomUUID(),
      variable,
      operation: 'set',
      value: '',
    };
  }

  const rhs = trimmed.slice(eqIndex + 1).trim();

  // Check if RHS references the same variable (compound operation)
  const rhsVarPattern = `:${variable}:`;
  if (rhs.startsWith(rhsVarPattern)) {
    const afterSelfRef = rhs.slice(rhsVarPattern.length).trim();

    // Detect operator: +, -, *
    if (afterSelfRef.startsWith('+')) {
      const val = afterSelfRef.slice(1).trim();
      const { value, currency } = extractValueAndCurrency(val);
      return {
        id: crypto.randomUUID(),
        variable,
        operation: 'add',
        value,
        currency,
      };
    }
    if (afterSelfRef.startsWith('-')) {
      const val = afterSelfRef.slice(1).trim();
      const { value, currency } = extractValueAndCurrency(val);
      return {
        id: crypto.randomUUID(),
        variable,
        operation: 'subtract',
        value,
        currency,
      };
    }
    if (afterSelfRef.startsWith('*')) {
      const val = afterSelfRef.slice(1).trim();
      return {
        id: crypto.randomUUID(),
        variable,
        operation: 'multiply',
        value: val,
      };
    }
  }

  // Simple set operation
  const { value, currency } = extractValueAndCurrency(rhs);
  return {
    id: crypto.randomUUID(),
    variable,
    operation: 'set',
    value,
    currency,
  };
}

/**
 * Extract value and optional currency code from a value string.
 * "5 USD" → { value: "5", currency: "USD" }
 * "1.1"   → { value: "1.1", currency: undefined }
 */
function extractValueAndCurrency(raw: string): {
  value: string;
  currency?: string;
} {
  const parts = raw.trim().split(/\s+/);
  if (parts.length === 2 && /^[a-zA-Z]{3}$/.test(parts[1])) {
    return { value: parts[0], currency: parts[1].toLowerCase() };
  }
  return { value: raw.trim() };
}

/**
 * Parse a full API rule into a StructuredRule.
 */
export function parseRuleFromAPI(rule: IRuleFromAPI): IStructuredRule {
  return {
    name: rule.name,
    description: rule.description || '',
    context: rule.context,
    conditions: parseConditionString(rule.condition),
    actions: rule.actions.map(parseActionExpression),
    startsAt: rule.startsAt,
    endsAt: rule.endsAt,
  };
}

// Re-export the variable regex for use in other modules
export { VARIABLE_REGEX };
