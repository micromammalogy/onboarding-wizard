'use client';

import { useState, useCallback } from 'react';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import type { ITask, ITaskStatus, ITaskUpdate } from '@/types/database';
import type { ITaskBadges } from './TaskListPanel';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { ConditionalWrapper } from '../ConditionalWrapper';
import styles from './TaskListItem.module.scss';

type ITaskListItemProps = {
  task: ITask;
  isSelected: boolean;
  computedDueDate?: Date | null;
  taskBadges: ITaskBadges;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

function formatDueDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(task: ITask, computedDueDate?: Date | null): boolean {
  const dueDate = computedDueDate ?? (task.due_date_fixed ? new Date(task.due_date_fixed) : null);
  if (!dueDate) return false;
  if (['complete', 'ob_verified', 'skipped'].includes(task.status)) return false;
  return dueDate < new Date();
}

export function TaskListItem({ task, isSelected, computedDueDate, taskBadges, onUpdate }: ITaskListItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const selectTask = useOnboardingNavStore(s => s.selectTask);

  const isComplete = ['complete', 'ob_verified'].includes(task.status);
  const overdue = isOverdue(task, computedDueDate);
  const dueDate = computedDueDate ?? (task.due_date_fixed ? new Date(task.due_date_fixed) : null);

  // Badge checks using template_task_id
  const templateId = task.template_task_id ?? '';
  const hasEmail = taskBadges.emailTaskIds.has(templateId);
  const isConditional = taskBadges.conditionalTaskIds.has(templateId);
  const hasDueDate = taskBadges.dueDateTaskIds.has(templateId);

  const handleCheckboxClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isUpdating) return;
      setIsUpdating(true);
      try {
        let nextStatus: ITaskStatus;
        if (isComplete) {
          nextStatus = 'pending';
        } else {
          nextStatus = task.assignee_type === 'merchant' ? 'merchant_complete' : 'complete';
        }
        await onUpdate(task.id, {
          status: nextStatus,
          completed_at: isComplete ? null : new Date().toISOString(),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [isComplete, isUpdating, task, onUpdate],
  );

  const handleClick = useCallback(() => {
    selectTask(task.id);
  }, [selectTask, task.id]);

  const visibilityId = task.template_task_id ?? task.id;

  return (
    <ConditionalWrapper id={visibilityId}>
      <div
        className={`${styles.item} ${isSelected ? styles.itemSelected : ''} ${isComplete ? styles.itemComplete : ''} ${overdue ? styles.itemOverdue : ''}`}
        onClick={handleClick}
      >
        <div
          className={styles.checkbox}
          onClick={handleCheckboxClick}
        >
          {isComplete ? (
            <div className={styles.checkboxDone}>
              <CheckmarkIcon size={10} color="gray0" />
            </div>
          ) : (
            <div className={styles.checkboxEmpty} />
          )}
        </div>

        <div className={styles.content}>
          <span className={`${styles.title} ${isComplete ? styles.titleDone : ''}`}>
            {task.title}
          </span>
        </div>

        <div className={styles.meta}>
          {hasEmail && (
            <span className={styles.badgeEmail} title="Email task">✉</span>
          )}
          {isConditional && (
            <span className={styles.badgeConditional} title="Conditional">⚡</span>
          )}
          {hasDueDate && (
            <span className={styles.badgeDueDate} title="Dynamic due date">📅</span>
          )}
          {task.assignee_type === 'merchant' && (
            <span className={styles.merchantDot} title="Merchant task" />
          )}
          {dueDate && (
            <span className={`${styles.dueDate} ${overdue ? styles.dueDateOverdue : ''}`}>
              {formatDueDate(dueDate)}
            </span>
          )}
        </div>
      </div>
    </ConditionalWrapper>
  );
}
