'use client';

import styles from './RunProgressBar.module.scss';

type IRunProgressBarProps = {
  completedTasks: number;
  totalTasks: number;
};

export function RunProgressBar({
  completedTasks,
  totalTasks,
}: IRunProgressBarProps) {
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
