import type { IResolvedDueDateRule, IFieldValueMap } from './types';

/**
 * Adds business days (skipping weekends) to a date
 */
function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let remaining = Math.abs(days);
  const direction = days >= 0 ? 1 : -1;

  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  return result;
}

/**
 * Adds calendar days/hours/weeks to a date
 */
function addOffset(
  start: Date,
  value: number,
  unit: 'days' | 'hours' | 'weeks',
  direction: 'before' | 'after',
  workdaysOnly: boolean,
): Date {
  const multiplier = direction === 'before' ? -1 : 1;

  if (workdaysOnly && unit === 'days') {
    return addBusinessDays(start, value * multiplier);
  }

  const result = new Date(start);

  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + value * multiplier);
      break;
    case 'hours':
      result.setHours(result.getHours() + value * multiplier);
      break;
    case 'weeks':
      result.setDate(result.getDate() + value * 7 * multiplier);
      break;
  }

  return result;
}

/**
 * Computes due dates for tasks based on due date rules.
 *
 * @param rules - Resolved due date rules
 * @param fieldValues - Current field values (keyed by widget_key)
 * @param projectStartDate - The project's start date
 * @returns Map of taskId -> computed due date
 */
export function computeDueDates(
  rules: IResolvedDueDateRule[],
  fieldValues: IFieldValueMap,
  projectStartDate: Date | null,
): Map<string, Date> {
  const dueDates = new Map<string, Date>();

  for (const rule of rules) {
    let sourceDate: Date | null = null;

    if (rule.source === 'checklist_start') {
      sourceDate = projectStartDate;
    } else if (rule.source === 'form_field' && rule.sourceWidgetKey) {
      const dateStr = fieldValues.get(rule.sourceWidgetKey);
      if (dateStr) {
        sourceDate = new Date(dateStr);
      }
    }

    if (!sourceDate || isNaN(sourceDate.getTime())) continue;

    const computed = addOffset(
      sourceDate,
      rule.offsetValue,
      rule.offsetUnit,
      rule.direction,
      rule.workdaysOnly,
    );

    dueDates.set(rule.targetTaskId, computed);
  }

  return dueDates;
}
