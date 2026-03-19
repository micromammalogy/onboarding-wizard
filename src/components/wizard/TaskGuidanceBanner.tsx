'use client';

import { useTaskStore, type ITaskId } from '@/hooks/useTaskStore';
import styles from './TaskGuidanceBanner.module.scss';

type IProps = {
  taskId: ITaskId;
  title: string;
  description: string;
};

export const TaskGuidanceBanner = ({ taskId, title, description }: IProps) => {
  const { completedTasks, markComplete, markIncomplete, onboardingDismissed } = useTaskStore();
  const done = !!completedTasks[taskId];

  if (onboardingDismissed) return null;

  return (
    <div className={`${styles.banner} ${done ? styles.done : styles.active}`}>
      <div className={styles.content}>
        <div className={styles.textBlock}>
          <span className={styles.stepLabel}>
            {done ? 'Completed' : 'Setup task'}
          </span>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
        </div>
        <button
          type="button"
          className={`${styles.markButton} ${done ? styles.markButtonDone : ''}`}
          onClick={() => (done ? markIncomplete(taskId) : markComplete(taskId))}
        >
          {done ? 'Mark incomplete' : 'Mark as complete'}
        </button>
      </div>
    </div>
  );
};
