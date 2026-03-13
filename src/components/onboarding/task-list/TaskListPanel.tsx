'use client';

import { useMemo, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useFieldValues } from '@/hooks/useFieldValues';
import type { ITask, ITaskUpdate } from '@/types/database';
import { TaskListSection } from './TaskListSection';
import styles from './TaskListPanel.module.scss';

export type ITaskBadges = {
  emailTaskIds: Set<string>;
  conditionalTaskIds: Set<string>;
  dueDateTaskIds: Set<string>;
};

type ITaskListPanelProps = {
  tasks: ITask[];
  selectedTaskId: string | null;
  dueDates: Map<string, Date>;
  projectId: string;
  taskBadges: ITaskBadges;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
  onCreate: (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => Promise<ITask>;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];
const NON_OVERDUE_STATUSES = ['complete', 'ob_verified', 'skipped'];

export function TaskListPanel({
  tasks,
  selectedTaskId,
  dueDates,
  projectId,
  taskBadges,
  onUpdate,
  onCreate,
}: ITaskListPanelProps) {
  const selectTask = useOnboardingNavStore(s => s.selectTask);
  const isVisible = useFieldValues(s => s.isVisible);

  const sections = useMemo(() => {
    const grouped = new Map<string, ITask[]>();
    for (const task of tasks) {
      // Don't filter by is_visible here — ConditionalWrapper in TaskListItem
      // handles visibility via the rules engine. Filtering here would prevent
      // hidden-by-default tasks from ever being shown when rules trigger.
      const section = task.section || 'Uncategorized';
      const existing = grouped.get(section) || [];
      existing.push(task);
      grouped.set(section, existing);
    }
    return Array.from(grouped.entries());
  }, [tasks]);

  const totalCompleted = tasks.filter(t => {
    const vid = t.template_task_id ?? t.id;
    return isVisible(vid) && COMPLETE_STATUSES.includes(t.status);
  }).length;
  const totalVisible = tasks.filter(t => isVisible(t.template_task_id ?? t.id)).length;
  const pct = totalVisible > 0 ? Math.round((totalCompleted / totalVisible) * 100) : 0;

  const overdueCount = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      if (!isVisible(t.template_task_id ?? t.id)) return false;
      if (NON_OVERDUE_STATUSES.includes(t.status)) return false;
      const dueDate = dueDates.get(t.id) ?? (t.due_date_fixed ? new Date(t.due_date_fixed) : null);
      if (!dueDate) return false;
      return dueDate < now;
    }).length;
  }, [tasks, dueDates, isVisible]);

  const handleCreate = useCallback(async () => {
    // Get the last section name and max order_index
    const lastTask = tasks[tasks.length - 1];
    const section = lastTask?.section ?? 'Uncategorized';
    const maxOrder = tasks.reduce((max, t) => Math.max(max, t.order_index), 0);

    const newTask = await onCreate({
      project_id: projectId,
      template_task_id: null,
      title: 'New task',
      description: null,
      section,
      order_index: maxOrder + 1,
      assignee_type: 'ob',
      assignee_id: null,
      due_date_type: 'fixed',
      due_date_offset_days: null,
      due_date_fixed: null,
      status: 'pending',
      task_type: 'manual',
      metadata: {},
      is_stop_gate: false,
      is_visible: true,
      completed_at: null,
      verified_at: null,
      verified_by: null,
    });

    // Auto-select the new task so user can immediately edit
    if (newTask?.id) {
      selectTask(newTask.id);
    }
  }, [tasks, projectId, onCreate, selectTask]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Tasks</span>
        <span className={styles.headerCount}>
          {totalCompleted}/{totalVisible} ({pct}%)
          {overdueCount > 0 && (
            <span className={styles.headerOverdue}>
              {' · '}{overdueCount} overdue
            </span>
          )}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.sections}>
        {sections.map(([title, sectionTasks]) => (
          <TaskListSection
            key={title}
            title={title}
            tasks={sectionTasks}
            selectedTaskId={selectedTaskId}
            dueDates={dueDates}
            taskBadges={taskBadges}
            onUpdate={onUpdate}
          />
        ))}

        <div className={styles.addTaskRow}>
          <Button
            size="sm"
            variant="subtle"
            icon={<PlusIcon size={14} />}
            onClick={handleCreate}
          >
            Add task
          </Button>
        </div>
      </div>
    </div>
  );
}
