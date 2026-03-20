'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useFieldValues } from '@/hooks/useFieldValues';
import type { ITask, ITaskUpdate } from '@/types/database';
import type { ITaskBadges } from '@/components/onboarding/task-list/TaskListPanel';
import { TaskListSection } from '@/components/onboarding/task-list/TaskListSection';
import styles from './RunTaskList.module.scss';

type IRunTaskListProps = {
  tasks: ITask[];
  selectedTaskId: string | null;
  dueDates: Map<string, Date>;
  projectId: string;
  projectName: string;
  taskBadges: ITaskBadges;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function RunTaskList({
  tasks,
  selectedTaskId,
  dueDates,
  projectId,
  projectName,
  taskBadges,
  onUpdate,
}: IRunTaskListProps) {
  const [hideCompleted, setHideCompleted] = useState(false);
  const [runName, setRunName] = useState(projectName);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isVisible = useFieldValues(s => s.isVisible);

  const sections = useMemo(() => {
    const grouped = new Map<string, ITask[]>();
    for (const task of tasks) {
      if (hideCompleted && COMPLETE_STATUSES.includes(task.status)) {
        continue;
      }
      const section = task.section || 'Uncategorized';
      const existing = grouped.get(section) || [];
      existing.push(task);
      grouped.set(section, existing);
    }
    return Array.from(grouped.entries());
  }, [tasks, hideCompleted]);

  const totalCompleted = tasks.filter(t => {
    const vid = t.template_task_id ?? t.id;
    return isVisible(vid) && COMPLETE_STATUSES.includes(t.status);
  }).length;
  const totalVisible = tasks.filter(t => isVisible(t.template_task_id ?? t.id)).length;
  const pct = totalVisible > 0 ? Math.round((totalCompleted / totalVisible) * 100) : 0;

  const handleNameBlur = useCallback(() => {
    // In a real implementation, this would persist the run name
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <textarea
          className={styles.runNameInput}
          value={runName}
          onChange={e => setRunName(e.target.value)}
          onBlur={handleNameBlur}
          rows={1}
        />
        <div className={styles.headerActions}>
          <span className={styles.progressLabel}>
            {totalCompleted}/{totalVisible} ({pct}%)
          </span>
          <div className={styles.menuWrapper} ref={menuRef}>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => setShowMenu(!showMenu)}
            >
              ...
            </Button>
            {showMenu && (
              <div className={styles.menuDropdown}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setHideCompleted(!hideCompleted);
                    setShowMenu(false);
                  }}
                >
                  {hideCompleted ? 'Show Completed' : 'Hide Completed'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        {sections.map(([title, sectionTasks]) => (
          <TaskListSection
            key={title}
            title={title}
            tasks={sectionTasks}
            selectedTaskId={selectedTaskId}
            dueDates={dueDates}
            taskBadges={taskBadges}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
