'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@zonos/amino/icons/ChevronDownIcon';
import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
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
  const [collapsed, setCollapsed] = useState(false);

  const completedCount = tasks.filter(t => COMPLETE_STATUSES.includes(t.status)).length;

  return (
    <div className={styles.section}>
      <button
        type="button"
        className={styles.header}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className={styles.chevron}>
          {collapsed ? (
            <ChevronRightIcon size={14} />
          ) : (
            <ChevronDownIcon size={14} />
          )}
        </span>
        <span className={styles.title}>{title}</span>
        <span className={styles.count}>
          {completedCount}/{tasks.length}
        </span>
      </button>

      {!collapsed && (
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
      )}
    </div>
  );
}
