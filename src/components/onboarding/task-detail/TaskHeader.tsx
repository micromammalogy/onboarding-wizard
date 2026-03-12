'use client';

import { useState } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import type { ITask, ITaskStatus, ITaskUpdate } from '@/types/database';
import styles from './TaskHeader.module.scss';

type ITaskHeaderProps = {
  task: ITask;
  computedDueDate?: Date | null;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'merchant_complete', label: 'Merchant done' },
  { value: 'ob_verified', label: 'Verified' },
  { value: 'complete', label: 'Complete' },
  { value: 'skipped', label: 'Skipped' },
];

type BadgeColor = 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'purple' | 'red';

const STATUS_COLORS: Record<ITaskStatus, BadgeColor> = {
  pending: 'gray',
  in_progress: 'blue',
  merchant_complete: 'orange',
  ob_verified: 'green',
  complete: 'green',
  skipped: 'gray',
};

function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function TaskHeader({ task, computedDueDate, onUpdate }: ITaskHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const dueDate = computedDueDate ?? (task.due_date_fixed ? new Date(task.due_date_fixed) : null);
  const selectedStatus = STATUS_OPTIONS.find(o => o.value === task.status) ?? STATUS_OPTIONS[0];

  const handleStatusChange = async (opt: { value: string; label: string } | null) => {
    if (!opt || isUpdating) return;
    setIsUpdating(true);
    try {
      const updates: ITaskUpdate = { status: opt.value as ITaskStatus };
      if (['complete', 'ob_verified'].includes(opt.value)) {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }
      await onUpdate(task.id, updates);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{task.title}</h2>
        {task.is_stop_gate && (
          <Badge color="red" size="small">Stop Gate</Badge>
        )}
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.controls}>
        <div className={styles.controlItem}>
          <span className={styles.controlLabel}>Status</span>
          <Select
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onChange={handleStatusChange}
            size="sm"
          />
        </div>

        <div className={styles.controlItem}>
          <span className={styles.controlLabel}>Assignee</span>
          <Badge color={task.assignee_type === 'merchant' ? 'orange' : 'blue'} size="small">
            {task.assignee_type === 'merchant' ? 'Merchant' : 'OB Rep'}
          </Badge>
        </div>

        {dueDate && (
          <div className={styles.controlItem}>
            <span className={styles.controlLabel}>Due Date</span>
            <span className={styles.controlValue}>{formatDate(dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
