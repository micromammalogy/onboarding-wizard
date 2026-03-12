'use client';

import type { ITask, ITaskUpdate } from '@/types/database';
import { TaskListItem } from './TaskListItem';
import styles from './TaskListSection.module.scss';

type ITaskListSectionProps = {
  title: string;
  tasks: ITask[];
  selectedTaskId: string | null;
  dueDates: Map<string, Date>;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function TaskListSection({
  title,
  tasks,
  selectedTaskId,
  dueDates,
  onUpdate,
}: ITaskListSectionProps) {
  const completedCount = tasks.filter(t => COMPLETE_STATUSES.includes(t.status)).length;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>
          {completedCount}/{tasks.length}
        </span>
      </div>

      <div className={styles.tasks}>
        {tasks.map(task => (
          <TaskListItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            computedDueDate={dueDates.get(task.id) ?? null}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
