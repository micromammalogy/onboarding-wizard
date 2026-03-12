'use client';

import { useMemo } from 'react';
import type { ITask, ITaskUpdate } from '@/types/database';
import { TaskListSection } from './TaskListSection';
import styles from './TaskListPanel.module.scss';

type ITaskListPanelProps = {
  tasks: ITask[];
  selectedTaskId: string | null;
  dueDates: Map<string, Date>;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function TaskListPanel({
  tasks,
  selectedTaskId,
  dueDates,
  onUpdate,
}: ITaskListPanelProps) {
  const sections = useMemo(() => {
    const grouped = new Map<string, ITask[]>();
    for (const task of tasks) {
      if (!('is_visible' in task ? task.is_visible : true)) continue;
      const section = task.section || 'Uncategorized';
      const existing = grouped.get(section) || [];
      existing.push(task);
      grouped.set(section, existing);
    }
    return Array.from(grouped.entries());
  }, [tasks]);

  const totalCompleted = tasks.filter(t =>
    t.is_visible && COMPLETE_STATUSES.includes(t.status),
  ).length;
  const totalVisible = tasks.filter(t => t.is_visible).length;
  const pct = totalVisible > 0 ? Math.round((totalCompleted / totalVisible) * 100) : 0;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Tasks</span>
        <span className={styles.headerCount}>
          {totalCompleted}/{totalVisible} ({pct}%)
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
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
