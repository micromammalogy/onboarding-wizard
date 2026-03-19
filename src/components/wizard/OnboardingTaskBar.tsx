'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronUpIcon } from '@zonos/amino/icons/ChevronUpIcon';
import { ChevronDownIcon } from '@zonos/amino/icons/ChevronDownIcon';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import { useNavStore } from '@/hooks/useNavStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import {
  useTaskStore,
  ONBOARDING_TASKS,
  TASK_ORDER,
  type ITaskId,
} from '@/hooks/useTaskStore';
import { fireCompletionConfetti } from '@/lib/confetti';
import styles from './OnboardingTaskBar.module.scss';

export const OnboardingTaskBar = () => {
  const [expanded, setExpanded] = useState(true);
  const { completedTasks, markComplete, markIncomplete, onboardingDismissed, dismissOnboarding } = useTaskStore();
  const { setActivePage } = useNavStore();
  const { ecommercePlatform } = useOnboardingStore();
  const prevCompletedCount = useRef(0);

  // Auto-mark platform task complete once a platform has been selected
  useEffect(() => {
    if (ecommercePlatform && !completedTasks.platform) {
      markComplete('platform');
    }
  }, [ecommercePlatform, completedTasks.platform, markComplete]);

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const total = ONBOARDING_TASKS.length;
  const allDone = completedCount === total;

  // Fire confetti and permanently dismiss task bar when all tasks become complete
  useEffect(() => {
    if (allDone && prevCompletedCount.current < total && !onboardingDismissed) {
      fireCompletionConfetti();
      setTimeout(() => dismissOnboarding(), 4500);
    }
    prevCompletedCount.current = completedCount;
  }, [allDone, completedCount, total, onboardingDismissed, dismissOnboarding]);

  if (onboardingDismissed) return null;

  // Find the next incomplete task (for "Next step" flag)
  const nextTaskId = TASK_ORDER.find(id => !completedTasks[id]);

  const handleNavigate = (page: string) => {
    if (page) setActivePage(page);
  };

  const handleToggle = (id: ITaskId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (completedTasks[id]) {
      markIncomplete(id);
    } else {
      markComplete(id);
    }
  };

  return (
    <div className={styles.taskBar}>
      {/* Header row — always visible */}
      <button
        className={styles.header}
        onClick={() => setExpanded(v => !v)}
        type="button"
      >
        <div className={styles.headerLeft}>
          <span className={styles.headerLabel}>Setup tasks</span>
          <span className={styles.counter}>
            {completedCount}/{total}
          </span>
        </div>
        <span className={styles.chevron}>
          {expanded ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
        </span>
      </button>

      {/* Progress bar */}
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${(completedCount / total) * 100}%` }}
        />
      </div>

      {/* Task list */}
      {expanded && (
        <ul className={styles.list}>
          {ONBOARDING_TASKS.map(task => {
            const done = !!completedTasks[task.id];
            const isNext = task.id === nextTaskId;
            return (
              <li key={task.id} className={styles.item}>
                {/* Checkbox */}
                <button
                  type="button"
                  className={`${styles.checkbox} ${done ? styles.checked : ''}`}
                  onClick={e => handleToggle(task.id, e)}
                  title={done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {done && <CheckmarkIcon size={10} />}
                </button>

                {/* Label — clickable if has a page target */}
                <button
                  type="button"
                  className={`${styles.taskLabel} ${done ? styles.taskDone : ''}`}
                  onClick={() => handleNavigate(task.page)}
                  disabled={!task.page}
                >
                  {task.label}
                </button>

                {/* Next step badge */}
                {isNext && !done && (
                  <span className={styles.nextBadge}>Next</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
