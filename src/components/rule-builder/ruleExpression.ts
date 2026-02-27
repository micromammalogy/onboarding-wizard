/**
 * Converts StructuredRule → expression strings for the API.
 *
 * Condition format: ":variable: operator value [connector :variable: operator value ...]"
 * Action format:    [":variable: = expression", ...]
 */

import type { IRuleCondition, IRuleAction, IStructuredRule } from './types';

/** Map of variable name → token type string (e.g. "categories" → "STRING_LIST") */
export type ITokenTypeMap = Record<string, string>;

// Types whose values the RuleDgs parser would misinterpret as variable references
// unless single-quoted. Numeric types, booleans, countries, and currencies are fine bare.
const STRING_QUOTE_TYPES = new Set([
  'STRING',
  'STRING_LIST',
]);

// Types that should never be quoted (numeric, boolean, country/currency codes)
const BARE_VALUE_TYPES = new Set([
  'NUMBER',
  'MONEY',
  'WEIGHT',
  'LENGTH',
  'VOLUME',
  'BOOLEAN',
  'COUNTRY',
  'CURRENCY',
  'NUMBER_LIST',
  'MONEY_LIST',
  'WEIGHT_LIST',
  'LENGTH_LIST',
  'VOLUME_LIST',
  'BOOLEAN_LIST',
  'COUNTRY_LIST',
  'CURRENCY_LIST',
]);

/**
 * Format a condition value based on its token type.
 * - STRING types → always single-quoted ('toys', 'hello world')
 * - COUNTRY/CURRENCY → lowercase, bare (us, usd)
 * - NUMBER/BOOLEAN → bare (5, true)
 * - MONEY → number + lowercase currency (10 usd)
 * - Unknown type → quote if it looks like it could be a variable name
 */
function formatConditionValue(value: string, tokenType?: string): string {
  if (!tokenType) {
    // Safety: if we don't know the type, quote anything that isn't obviously numeric/boolean
    if (/^-?\d+(\.\d+)?$/.test(value) || value === 'true' || value === 'false') {
      return value;
    }
    return `'${value}'`;
  }

  if (STRING_QUOTE_TYPES.has(tokenType)) {
    return `'${value}'`;
  }

  // All other known types are bare values
  return value;
}

/**
 * Format an action value based on its token type.
 * Same logic but also handles MONEY currency appending.
 */
function formatActionValue(
  value: string,
  currency: string | undefined,
  tokenType?: string,
): string {
  if (currency) {
    return `${value} ${currency.toLowerCase()}`;
  }

  if (!tokenType) {
    if (/^-?\d+(\.\d+)?$/.test(value) || value === 'true' || value === 'false') {
      return value;
    }
    return `'${value}'`;
  }

  if (STRING_QUOTE_TYPES.has(tokenType)) {
    return `'${value}'`;
  }

  return value;
}

/**
 * Build a single condition fragment: `:variable: operator value`
 */
function buildConditionFragment(
  c: IRuleCondition,
  typeMap: ITokenTypeMap,
): string {
  const variable = `:${c.variable}:`;
  const tokenType = typeMap[c.variable];
  const value = formatConditionValue(c.value, tokenType);
  return `${variable} ${c.operator} ${value}`;
}

/**
 * Build the full condition string from an array of conditions.
 * Each condition's `connector` links it to the NEXT condition.
 */
export function buildConditionString(
  conditions: IRuleCondition[],
  typeMap: ITokenTypeMap = {},
): string {
  if (conditions.length === 0) return '';

  return conditions
    .map((c, i) => {
      const fragment = buildConditionFragment(c, typeMap);
      // Don't append connector after the last condition
      if (i < conditions.length - 1) {
        return `${fragment} ${c.connector}`;
      }
      return fragment;
    })
    .join(' ');
}

/**
 * Build a single action expression string.
 *
 * - set:      `:variable: = value`
 * - add:      `:variable: = :variable: + value`
 * - subtract: `:variable: = :variable: - value`
 * - multiply: `:variable: = :variable: * value`
 */
function buildActionExpression(
  a: IRuleAction,
  typeMap: ITokenTypeMap,
): string {
  const variable = `:${a.variable}:`;
  const tokenType = typeMap[a.variable];
  const valueFormatted = formatActionValue(a.value, a.currency, tokenType);

  switch (a.operation) {
    case 'set':
      return `${variable} = ${valueFormatted}`;
    case 'add':
      return `${variable} = ${variable} + ${valueFormatted}`;
    case 'subtract':
      return `${variable} = ${variable} - ${valueFormatted}`;
    case 'multiply':
      return `${variable} = ${variable} * ${a.value}`;
    default:
      return `${variable} = ${valueFormatted}`;
  }
}

/**
 * Build the actions array from structured actions.
 */
export function buildActionStrings(
  actions: IRuleAction[],
  typeMap: ITokenTypeMap = {},
): string[] {
  return actions
    .filter(a => a.variable && a.value)
    .map(a => buildActionExpression(a, typeMap));
}

/**
 * Convert a full StructuredRule to API format.
 * Pass tokenTypeMap to enable proper value formatting per variable type.
 */
export function structuredRuleToAPI(
  rule: IStructuredRule,
  tokenTypeMap: ITokenTypeMap = {},
) {
  const validConditions = rule.conditions.filter(c => c.variable && c.value);
  return {
    name: rule.name,
    description: rule.description || rule.name,
    context: rule.context,
    condition: buildConditionString(validConditions, tokenTypeMap),
    actions: buildActionStrings(rule.actions, tokenTypeMap),
    startsAt: rule.startsAt || undefined,
    endsAt: rule.endsAt || undefined,
  };
}

/**
 * Generate a plain-English description of the rule for the preview.
 */
export function buildHumanReadable(
  rule: IStructuredRule,
  tokenLabels: Record<string, string>,
): string {
  const validConditions = rule.conditions.filter(c => c.variable && c.value);
  const validActions = rule.actions.filter(a => a.variable && a.value);

  if (validConditions.length === 0 && validActions.length === 0) {
    return '';
  }

  const conditionParts = validConditions.map((c, i) => {
    const label = tokenLabels[c.variable] || c.variable;
    const operatorText = getHumanOperator(c.operator);
    const prefix = i === 0 ? 'If' : c.connector === 'or' ? 'or' : 'and';
    return `${prefix} ${label} ${operatorText} ${c.value}`;
  });

  const actionParts = validActions.map(a => {
    const label = tokenLabels[a.variable] || a.variable;
    const opText = getHumanOperation(a.operation);
    const valueText = a.currency ? `${a.value} ${a.currency}` : a.value;
    return `${opText} ${label} ${a.operation === 'set' ? 'to' : 'by'} ${valueText}`;
  });

  const conditionStr = conditionParts.join(' ');
  const actionStr = actionParts.join(', ');

  if (conditionStr && actionStr) {
    return `${conditionStr}, ${actionStr}`;
  }
  return actionStr || conditionStr;
}

function getHumanOperator(op: string): string {
  const map: Record<string, string> = {
    '==': 'is',
    '!=': 'is not',
    '>': 'is greater than',
    '<': 'is less than',
    '>=': 'is at least',
    '<=': 'is at most',
    any_contains: 'contains',
  };
  return map[op] || op;
}

function getHumanOperation(op: string): string {
  const map: Record<string, string> = {
    set: 'set',
    add: 'increase',
    subtract: 'decrease',
    multiply: 'multiply',
  };
  return map[op] || op;
}
