'use client';

import { useState } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import { UserIcon } from '@zonos/amino/icons/UserIcon';
import type { ITask, ITaskStatus, ITaskUpdate } from '@/types/database';
import styles from './TaskRow.module.scss';

type ITaskRowProps = {
  task: ITask & { assignee: { id: string; name: string; email: string } | null };
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
  onDelete: (taskId: string) => Promise<void>;
};

const STATUS_LABELS: Record<ITaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  merchant_complete: 'Merchant done',
  ob_verified: 'Verified',
  complete: 'Complete',
  skipped: 'Skipped',
};

const STATUS_COLORS: Record<ITaskStatus, string> = {
  pending: 'gray',
  in_progress: 'blue',
  merchant_complete: 'orange',
  ob_verified: 'green',
  complete: 'green',
  skipped: 'gray',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(task: ITask): boolean {
  if (!task.due_date_fixed) return false;
  if (['complete', 'ob_verified', 'skipped'].includes(task.status)) return false;
  return new Date(task.due_date_fixed) < new Date();
}

export function TaskRow({ task, onUpdate, onDelete }: ITaskRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const overdue = isOverdue(task);
  const isComplete = ['complete', 'ob_verified'].includes(task.status);
  const isMerchantDone = task.status === 'merchant_complete';

  const handleStatusCycle = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      let nextStatus: ITaskStatus;
      if (task.status === 'pending') {
        nextStatus = 'in_progress';
      } else if (task.status === 'in_progress') {
        nextStatus = task.assignee_type === 'merchant' ? 'merchant_complete' : 'complete';
      } else if (task.status === 'merchant_complete') {
        nextStatus = 'ob_verified';
      } else {
        return;
      }
      await onUpdate(task.id, { status: nextStatus });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerify = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdate(task.id, { status: 'ob_verified' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`${styles.row} ${isComplete ? styles.rowComplete : ''} ${overdue ? styles.rowOverdue : ''}`}
    >
      <div className={styles.checkbox} onClick={handleStatusCycle}>
        {isComplete ? (
          <div className={styles.checkboxDone}>
            <CheckmarkIcon size={12} color="white" />
          </div>
        ) : (
          <div className={styles.checkboxEmpty} />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={`${styles.title} ${isComplete ? styles.titleDone : ''}`}>
            {task.title}
          </span>
          {task.task_type === 'email_draft' && (
            <Badge color="purple" size="sm">Email</Badge>
          )}
        </div>

        <div className={styles.meta}>
          {task.assignee && (
            <span className={styles.metaItem}>
              <UserIcon size={12} />
              {task.assignee.name}
            </span>
          )}
          {!task.assignee && task.assignee_type === 'merchant' && (
            <span className={`${styles.metaItem} ${styles.merchantTag}`}>
              Merchant task
            </span>
          )}
          {task.due_date_fixed && (
            <span className={`${styles.metaItem} ${overdue ? styles.metaOverdue : ''}`}>
              Due {formatDate(task.due_date_fixed)}
            </span>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <Badge color={STATUS_COLORS[task.status]} size="sm">
          {STATUS_LABELS[task.status]}
        </Badge>
        {isMerchantDone && (
          <Button
            size="sm"
            variant="primary"
            onClick={handleVerify}
            loading={isUpdating}
          >
            Verify
          </Button>
        )}
      </div>
    </div>
  );
}
