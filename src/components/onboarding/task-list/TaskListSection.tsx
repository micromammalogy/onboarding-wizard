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
  const realTasks = tasks.filter(t => t.task_type !== 'section_header');
  const completedCount = realTasks.filter(t => COMPLETE_STATUSES.includes(t.status)).length;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>
          {completedCount}/{realTasks.length}
        </span>
      </div>

      <div className={styles.tasks}>
        {realTasks.map(task => (
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
