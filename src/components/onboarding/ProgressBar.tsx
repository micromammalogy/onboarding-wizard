'use client';

import { useTasks } from '@/hooks/useSupabase';
import styles from './ProgressBar.module.scss';

type IProgressBarProps = {
  projectId: string;
  compact?: boolean;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function ProgressBar({ projectId, compact = false }: IProgressBarProps) {
  const { tasks } = useTasks(projectId);

  if (tasks.length === 0) {
    return compact ? (
      <span className={styles.compactText}>—</span>
    ) : null;
  }

  const completed = tasks.filter(t => COMPLETE_STATUSES.includes(t.status)).length;
  const total = tasks.length;
  const pct = Math.round((completed / total) * 100);

  if (compact) {
    return (
      <div className={styles.compact}>
        <div className={styles.compactBar}>
          <div className={styles.compactFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={styles.compactText}>
          {completed}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.full}>
      <div className={styles.header}>
        <span className={styles.label}>Progress</span>
        <span className={styles.value}>
          {completed} of {total} tasks ({pct}%)
        </span>
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
