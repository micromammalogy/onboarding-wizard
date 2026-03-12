'use client';

import { useState, useRef, useCallback } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Select } from '@zonos/amino/components/select/Select';
import type { ITask, ITaskStatus, ITaskUpdate, ITaskAssigneeType } from '@/types/database';
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

const ASSIGNEE_OPTIONS = [
  { value: 'ob', label: 'OB Rep' },
  { value: 'merchant', label: 'Merchant' },
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

function toDateInputValue(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function TaskHeader({ task, computedDueDate, onUpdate }: ITaskHeaderProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [descValue, setDescValue] = useState(task.description ?? '');
  const [editingDesc, setEditingDesc] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const dueDate = computedDueDate ?? (task.due_date_fixed ? new Date(task.due_date_fixed) : null);
  const isComputedDue = !!computedDueDate;
  const selectedStatus = STATUS_OPTIONS.find(o => o.value === task.status) ?? STATUS_OPTIONS[0];
  const selectedAssignee = ASSIGNEE_OPTIONS.find(o => o.value === task.assignee_type) ?? ASSIGNEE_OPTIONS[0];

  // Sync local state when task changes
  const prevTaskId = useRef(task.id);
  if (prevTaskId.current !== task.id) {
    prevTaskId.current = task.id;
    setTitleValue(task.title);
    setDescValue(task.description ?? '');
    setEditingTitle(false);
    setEditingDesc(false);
  }

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

  const handleTitleBlur = useCallback(async () => {
    setEditingTitle(false);
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== task.title) {
      await onUpdate(task.id, { title: trimmed });
    } else {
      setTitleValue(task.title);
    }
  }, [titleValue, task.id, task.title, onUpdate]);

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setTitleValue(task.title);
      setEditingTitle(false);
    }
  };

  const handleDescBlur = useCallback(async () => {
    setEditingDesc(false);
    const trimmed = descValue.trim();
    if (trimmed !== (task.description ?? '')) {
      await onUpdate(task.id, { description: trimmed || null });
    }
  }, [descValue, task.id, task.description, onUpdate]);

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setDescValue(task.description ?? '');
      setEditingDesc(false);
    }
  };

  const handleAssigneeChange = async (opt: { value: string; label: string } | null) => {
    if (!opt || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdate(task.id, { assignee_type: opt.value as ITaskAssigneeType });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    await onUpdate(task.id, { due_date_fixed: val, due_date_type: 'fixed' });
  };

  return (
    <div className={styles.header}>
      <div className={styles.titleRow}>
        {editingTitle ? (
          <input
            ref={titleInputRef}
            className={styles.titleInput}
            value={titleValue}
            onChange={e => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
          />
        ) : (
          <h2
            className={styles.title}
            onClick={() => {
              setEditingTitle(true);
              setTitleValue(task.title);
            }}
            title="Click to edit"
          >
            {task.title}
          </h2>
        )}
        {task.is_stop_gate && (
          <Badge color="red" size="small">Stop Gate</Badge>
        )}
      </div>

      {editingDesc ? (
        <textarea
          className={styles.descInput}
          value={descValue}
          onChange={e => setDescValue(e.target.value)}
          onBlur={handleDescBlur}
          onKeyDown={handleDescKeyDown}
          autoFocus
          rows={3}
        />
      ) : (
        <p
          className={styles.description}
          onClick={() => {
            setEditingDesc(true);
            setDescValue(task.description ?? '');
          }}
          title="Click to edit"
        >
          {task.description || 'Add a description...'}
        </p>
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
          <Select
            value={selectedAssignee}
            options={ASSIGNEE_OPTIONS}
            onChange={handleAssigneeChange}
            size="sm"
          />
        </div>

        <div className={styles.controlItem}>
          <span className={styles.controlLabel}>Due Date</span>
          {isComputedDue ? (
            <span className={styles.controlValue} title="Computed from rule (read-only)">
              {formatDate(dueDate)}
            </span>
          ) : (
            <input
              type="date"
              className={styles.dateInput}
              value={toDateInputValue(task.due_date_fixed)}
              onChange={handleDueDateChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
