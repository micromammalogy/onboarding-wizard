'use client';

import { useTaskStore, TASK_ORDER, type ITaskId } from '@/hooks/useTaskStore';
import { useNavStore } from '@/hooks/useNavStore';
import { ONBOARDING_TASKS } from '@/hooks/useTaskStore';
import styles from './TaskGuidanceBanner.module.scss';

type IProps = {
  taskId: ITaskId;
  title: string;
  description: string;
};

export const TaskGuidanceBanner = ({ taskId, title, description }: IProps) => {
  const { completedTasks, markComplete, markIncomplete, onboardingDismissed } = useTaskStore();
  const { setActivePage } = useNavStore();
  const done = !!completedTasks[taskId];

  if (onboardingDismissed) return null;

  const handleMarkComplete = () => {
    markComplete(taskId);

    // Navigate to the next incomplete task's page
    const currentIndex = TASK_ORDER.indexOf(taskId);
    const nextTaskId = TASK_ORDER.slice(currentIndex + 1).find(
      id => !completedTasks[id],
    );
    if (nextTaskId) {
      const nextTask = ONBOARDING_TASKS.find(t => t.id === nextTaskId);
      if (nextTask?.page) {
        setActivePage(nextTask.page);
      }
    }
  };

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
          onClick={() => (done ? markIncomplete(taskId) : handleMarkComplete())}
        >
          {done ? 'Mark incomplete' : 'Mark as complete'}
        </button>
      </div>
    </div>
  );
};
