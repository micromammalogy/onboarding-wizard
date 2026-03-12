import type { IConditionOperator } from '@/types/database';
import type {
  IResolvedConditionalRule,
  IResolvedCondition,
  IFieldValueMap,
  IVisibilityMap,
  IHiddenByDefaultMap,
} from './types';

/**
 * Evaluates a single condition against a field value
 */
function evaluateCondition(
  condition: IResolvedCondition,
  fieldValues: IFieldValueMap,
): boolean {
  const value = fieldValues.get(condition.widgetKey) ?? null;

  switch (condition.operator) {
    case 'is':
      return value === condition.value;
    case 'is_not':
      return value !== condition.value;
    case 'contains':
      if (value == null || condition.value == null) return false;
      return value.toLowerCase().includes(condition.value.toLowerCase());
    case 'has_no_value':
      return value == null || value === '';
    default:
      return false;
  }
}

/**
 * Evaluates a group of AND conditions
 */
function evaluateAndGroup(
  conditions: IResolvedCondition[],
  fieldValues: IFieldValueMap,
): boolean {
  return conditions.every(c => evaluateCondition(c, fieldValues));
}

/**
 * Evaluates all conditional rules and returns a visibility map.
 *
 * Algorithm:
 * 1. Initialize visibility from hidden_by_default flags
 * 2. For each rule, evaluate trigger conditions (OR of AND groups)
 * 3. Apply SHOW/HIDE action to targets
 * 4. On conflict, HIDE wins
 */
export function evaluateRules(
  rules: IResolvedConditionalRule[],
  fieldValues: IFieldValueMap,
  hiddenByDefault: IHiddenByDefaultMap,
): IVisibilityMap {
  const visibility: IVisibilityMap = new Map();

  // Step 1: Initialize from hidden_by_default
  for (const [key, hidden] of hiddenByDefault) {
    visibility.set(key, !hidden);
  }

  // Track explicit hide actions (for conflict resolution: HIDE wins)
  const explicitlyHidden = new Set<string>();

  // Step 2-3: Evaluate each rule
  for (const rule of rules) {
    // OR of AND groups
    const triggered = rule.conditions.some(andGroup =>
      evaluateAndGroup(andGroup, fieldValues),
    );

    if (!triggered) continue;

    const targets: string[] = [
      ...rule.targetTaskIds,
      ...rule.targetWidgetIds,
    ];

    for (const target of targets) {
      if (rule.action === 'hide') {
        visibility.set(target, false);
        explicitlyHidden.add(target);
      } else if (rule.action === 'show') {
        // Only show if not explicitly hidden by another rule
        if (!explicitlyHidden.has(target)) {
          visibility.set(target, true);
        }
      }
    }
  }

  return visibility;
}
