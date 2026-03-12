'use client';

import { useMemo } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { useProject, useTasks } from '@/hooks/useSupabase';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { TaskRow } from '@/components/onboarding/TaskRow';
import type { IProjectStatus } from '@/types/database';
import styles from './ProjectDetailPage.module.scss';

type IProjectDetailPageProps = {
  projectId: string;
};

const STATUS_LABELS: Record<IProjectStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  on_hold: 'On hold',
  completed: 'Completed',
  canceled: 'Canceled',
};

const STATUS_COLORS: Record<IProjectStatus, string> = {
  not_started: 'gray',
  in_progress: 'blue',
  on_hold: 'orange',
  completed: 'green',
  canceled: 'red',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ProjectDetailPage({ projectId }: IProjectDetailPageProps) {
  const { project, isLoading: projectLoading, error: projectError, mutate: mutateProject } = useProject(projectId);
  const { tasks, isLoading: tasksLoading, error: tasksError, mutate: mutateTasks, updateTask, deleteTask } = useTasks(projectId);

  const sections = useMemo(() => {
    const grouped = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const section = task.section || 'Uncategorized';
      const existing = grouped.get(section) || [];
      existing.push(task);
      grouped.set(section, existing);
    }
    return Array.from(grouped.entries());
  }, [tasks]);

  if (projectLoading || tasksLoading) {
    return <LoadingState message="Loading project..." />;
  }

  if (projectError) {
    return <ErrorState message={projectError.message} onRetry={() => mutateProject()} />;
  }

  if (tasksError) {
    return <ErrorState message={tasksError.message} onRetry={() => mutateTasks()} />;
  }

  if (!project) {
    return <ErrorState message="Project not found" />;
  }

  return (
    <div className={styles.container}>
      {/* Project header */}
      <div className={styles.projectHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{project.merchant_name}</h1>
            <Badge color={STATUS_COLORS[project.status]}>
              {STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              ID: #{project.merchant_id}
            </span>
            {project.platform && (
              <span className={styles.metaItem}>{project.platform}</span>
            )}
            {project.store_url && (
              <span className={styles.metaItem}>{project.store_url}</span>
            )}
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>AE</span>
          <span className={styles.infoValue}>
            {project.ae?.name || '—'}
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>OB Rep</span>
          <span className={styles.infoValue}>
            {project.ob_rep?.name || '—'}
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Start Date</span>
          <span className={styles.infoValue}>
            {formatDate(project.start_date)}
          </span>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoLabel}>Target Completion</span>
          <span className={styles.infoValue}>
            {formatDate(project.projected_completion_date)}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <ProgressBar projectId={projectId} />
      </div>

      {/* Task sections */}
      <div className={styles.taskSections}>
        {sections.map(([section, sectionTasks]) => {
          const completedInSection = sectionTasks.filter(t =>
            ['complete', 'ob_verified', 'merchant_complete'].includes(t.status),
          ).length;

          return (
            <div key={section} className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>{section}</h3>
                <span className={styles.sectionCount}>
                  {completedInSection}/{sectionTasks.length}
                </span>
              </div>
              <div className={styles.taskList}>
                {sectionTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {sections.length === 0 && (
          <div className={styles.emptyTasks}>
            No tasks in this project yet.
          </div>
        )}
      </div>
    </div>
  );
}
