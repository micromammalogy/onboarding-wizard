'use client';

import { Badge } from '@zonos/amino/components/badge/Badge';
import { useTasks } from '@/hooks/useSupabase';

type IOverdueCountProps = {
  projectId: string;
};

const NON_OVERDUE_STATUSES = ['complete', 'ob_verified', 'skipped'];

export function OverdueCount({ projectId }: IOverdueCountProps) {
  const { tasks } = useTasks(projectId);

  const now = new Date();
  const overdueCount = tasks.filter(t => {
    if (NON_OVERDUE_STATUSES.includes(t.status)) return false;
    const dueDate = t.due_date_fixed ? new Date(t.due_date_fixed) : null;
    if (!dueDate) return false;
    return dueDate < now;
  }).length;

  if (overdueCount === 0) return <span style={{ color: 'var(--amino-gray-400)' }}>—</span>;

  return (
    <Badge color="red" size="small">
      {overdueCount} overdue
    </Badge>
  );
}
