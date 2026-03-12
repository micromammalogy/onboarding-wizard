import { useMemo } from 'react';
import { computeDueDates } from '@/lib/rules/computeDueDates';
import { useFieldValues } from '@/hooks/useFieldValues';
import type { IResolvedDueDateRule } from '@/lib/rules/types';

/**
 * Hook that computes due dates for tasks based on due date rules.
 * Re-computes whenever date field values change.
 */
export function useTaskDueDates(
  dueDateRules: IResolvedDueDateRule[],
  projectStartDate: Date | null,
): Map<string, Date> {
  const values = useFieldValues(s => s.values);

  return useMemo(
    () => computeDueDates(dueDateRules, values, projectStartDate),
    [dueDateRules, values, projectStartDate],
  );
}
