/**
 * Converts StructuredRule → expression strings for the API.
 *
 * Condition format: ":variable: operator value [connector :variable: operator value ...]"
 * Action format:    [":variable: = expression", ...]
 */

import type { IRuleCondition, IRuleAction, IStructuredRule } from './types';

/**
 * Build a single condition fragment: `:variable: operator value`
 * Values are formatted per the RuleDgs parser:
 * - COUNTRY/CURRENCY → lowercase (us, usd)
 * - STRING → quoted ('value')
 * - MONEY → number + lowercase currency (10 usd)
 * - NUMBER/BOOLEAN → as-is
 */
function buildConditionFragment(c: IRuleCondition): string {
  const variable = `:${c.variable}:`;
  const value = c.value.includes(' ') ? `'${c.value}'` : c.value;
  return `${variable} ${c.operator} ${value}`;
}

/**
 * Build the full condition string from an array of conditions.
 * Each condition's `connector` links it to the NEXT condition.
 */
export function buildConditionString(conditions: IRuleCondition[]): string {
  if (conditions.length === 0) return '';

  return conditions
    .map((c, i) => {
      const fragment = buildConditionFragment(c);
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
 *
 * For MONEY types with currency: `value CURRENCY` (e.g. "5 USD")
 */
function buildActionExpression(a: IRuleAction): string {
  const variable = `:${a.variable}:`;
  const valueWithCurrency = a.currency
    ? `${a.value} ${a.currency.toLowerCase()}`
    : a.value;

  switch (a.operation) {
    case 'set':
      return `${variable} = ${valueWithCurrency}`;
    case 'add':
      return `${variable} = ${variable} + ${valueWithCurrency}`;
    case 'subtract':
      return `${variable} = ${variable} - ${valueWithCurrency}`;
    case 'multiply':
      return `${variable} = ${variable} * ${a.value}`;
    default:
      return `${variable} = ${valueWithCurrency}`;
  }
}

/**
 * Build the actions array from structured actions.
 */
export function buildActionStrings(actions: IRuleAction[]): string[] {
  return actions
    .filter(a => a.variable && a.value)
    .map(buildActionExpression);
}

/**
 * Convert a full StructuredRule to API format.
 */
export function structuredRuleToAPI(rule: IStructuredRule) {
  const validConditions = rule.conditions.filter(c => c.variable && c.value);
  return {
    name: rule.name,
    description: rule.description || rule.name,
    context: rule.context,
    condition: buildConditionString(validConditions),
    actions: buildActionStrings(rule.actions),
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
