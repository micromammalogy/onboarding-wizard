'use client';

import { UserIcon } from '@zonos/amino/icons/UserIcon';
import { UsersIcon } from '@zonos/amino/icons/UsersIcon';
import { ClockIcon } from '@zonos/amino/icons/ClockIcon';
import { LockIcon } from '@zonos/amino/icons/LockIcon';
import { StarsIcon } from '@zonos/amino/icons/StarsIcon';
import { SettingsIcon } from '@zonos/amino/icons/SettingsIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import type { ITemplateTask, ITemplateRule } from '@/types/database';
import styles from './TaskActionsBar.module.scss';

type ITaskActionsBarProps = {
  task: ITemplateTask;
  rules: ITemplateRule[];
  onTaskUpdate: (taskId: string, updates: Partial<ITemplateTask>) => Promise<void>;
};

export function TaskActionsBar({
  task,
  rules,
  onTaskUpdate,
}: ITaskActionsBarProps) {
  const hasAssignees = !!task.assignee_type;
  const hasRules = rules.length > 0;
  const hasAutomations = (task.automations ?? []).length > 0;
  const isStopGate = task.is_stop_gate;

  const dueDateText = task.due_date_offset_days
    ? `${task.due_date_offset_days}d after start`
    : null;

  return (
    <div className={styles.container}>
      {/* Group 1: Assign + View assignees */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.actionButton}
          title="Assign task"
          type="button"
        >
          <UserIcon size={14} />
        </button>
        <button
          className={`${styles.actionButton} ${hasAssignees ? styles.active : ''}`}
          title="View assignees"
          type="button"
        >
          <UsersIcon size={14} />
          {hasAssignees && (
            <span className={styles.buttonLabel}>1</span>
          )}
        </button>
      </div>

      {/* Group 2: Due date */}
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.actionButton} ${dueDateText ? styles.active : ''}`}
          title={dueDateText ?? 'Set due date'}
          type="button"
        >
          <ClockIcon size={14} />
          {dueDateText && (
            <span className={styles.buttonLabel}>{dueDateText}</span>
          )}
        </button>
      </div>

      {/* Group 3: Permissions */}
      <div className={styles.buttonGroup}>
        <button
          className={styles.actionButton}
          title="Task permissions"
          type="button"
        >
          <LockIcon size={14} />
        </button>
      </div>

      {/* Group 4: Conditional logic + Automations */}
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.actionButton} ${hasRules ? styles.active : ''}`}
          title={hasRules ? `${rules.length} conditional rule(s)` : 'Conditional logic'}
          type="button"
        >
          <StarsIcon size={14} />
        </button>
        <button
          className={`${styles.actionButton} ${hasAutomations ? styles.active : ''}`}
          title={hasAutomations ? `${task.automations?.length} automation(s)` : 'Automations'}
          type="button"
        >
          <SettingsIcon size={14} />
        </button>
      </div>

      {/* Group 5: Stop gate */}
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.actionButton} ${isStopGate ? styles.active : ''}`}
          title={isStopGate ? 'Remove stop gate' : 'Add stop gate'}
          type="button"
          onClick={() => onTaskUpdate(task.id, { is_stop_gate: !isStopGate })}
        >
          <RemoveCircleIcon size={14} />
          <span className={styles.buttonLabel}>
            {isStopGate ? 'Stop' : 'Add Stop'}
          </span>
        </button>
      </div>
    </div>
  );
}
