'use client';

import type { ITask, ITaskUpdate } from '@/types/database';
import type { ITaskBadges } from './TaskListPanel';
import { useFieldValues } from '@/hooks/useFieldValues';
import { TaskListItem } from './TaskListItem';
import styles from './TaskListSection.module.scss';

type ITaskListSectionProps = {
  title: string;
  tasks: ITask[];
  selectedTaskId: string | null;
  dueDates: Map<string, Date>;
  taskBadges: ITaskBadges;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function TaskListSection({
  title,
  tasks,
  selectedTaskId,
  dueDates,
  taskBadges,
  onUpdate,
}: ITaskListSectionProps) {
  const isVisible = useFieldValues(s => s.isVisible);
  const realTasks = tasks.filter(t => t.task_type !== 'section_header');
  const visibleTasks = realTasks.filter(t => isVisible(t.template_task_id ?? t.id));
  const completedCount = visibleTasks.filter(t => COMPLETE_STATUSES.includes(t.status)).length;

  // Hide entire section if all tasks are hidden
  if (visibleTasks.length === 0) return null;

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>
          {completedCount}/{visibleTasks.length}
        </span>
      </div>

      <div className={styles.tasks}>
        {realTasks.map(task => (
          <TaskListItem
            key={task.id}
            task={task}
            isSelected={task.id === selectedTaskId}
            computedDueDate={dueDates.get(task.id) ?? null}
            taskBadges={taskBadges}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
