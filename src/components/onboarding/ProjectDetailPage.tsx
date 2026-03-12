'use client';

import { useEffect, useMemo } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import { ArrowLeftIcon } from '@zonos/amino/icons/ArrowLeftIcon';
import { useProject, useTasks, useFieldValuesData, useAllTemplateWidgets, useTemplateRules } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useFieldValues } from '@/hooks/useFieldValues';
import { useTaskDueDates } from '@/hooks/useTaskDueDates';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TaskListPanel } from '@/components/onboarding/task-list/TaskListPanel';
import { TaskDetailPanel } from '@/components/onboarding/task-detail/TaskDetailPanel';
import { toResolvedConditionalRule, toResolvedDueDateRule } from '@/lib/rules/types';
import type { IProjectStatus, ITemplateRule } from '@/types/database';
import type { IResolvedConditionalRule, IResolvedDueDateRule, IHiddenByDefaultMap } from '@/lib/rules/types';
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

type BadgeColor = 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'purple' | 'red';

const STATUS_COLORS: Record<IProjectStatus, BadgeColor> = {
  not_started: 'gray',
  in_progress: 'blue',
  on_hold: 'orange',
  completed: 'green',
  canceled: 'red',
};

export function ProjectDetailPage({ projectId }: IProjectDetailPageProps) {
  const { project, isLoading: projectLoading, error: projectError, mutate: mutateProject } = useProject(projectId);
  const { tasks, isLoading: tasksLoading, error: tasksError, mutate: mutateTasks, updateTask } = useTasks(projectId);
  const { fieldValues, isLoading: fvLoading } = useFieldValuesData(projectId);
  const { widgets, isLoading: widgetsLoading } = useAllTemplateWidgets(project?.template_id ?? null);
  const { rules: rawRules, isLoading: rulesLoading } = useTemplateRules(project?.template_id ?? null);

  const selectedTaskId = useOnboardingNavStore(s => s.selectedTaskId);
  const selectTask = useOnboardingNavStore(s => s.selectTask);
  const backToList = useOnboardingNavStore(s => s.backToList);

  const initFieldValues = useFieldValues(s => s.init);
  const resetFieldValues = useFieldValues(s => s.reset);

  // Resolve rules
  const { conditionalRules, dueDateRules } = useMemo(() => {
    const widgetKeyToId = new Map<string, string>();
    for (const w of widgets) {
      if (w.key && w.ps_group_id) {
        widgetKeyToId.set(w.key, w.ps_group_id);
      }
    }

    const taskIdMap = new Map<string, string>();

    const conditional: IResolvedConditionalRule[] = [];
    const dueDate: IResolvedDueDateRule[] = [];

    for (const rule of rawRules) {
      if (rule.rule_type === 'conditional') {
        const resolved = toResolvedConditionalRule(rule, widgetKeyToId);
        if (resolved) conditional.push(resolved);
      } else if (rule.rule_type === 'due_date') {
        const resolved = toResolvedDueDateRule(rule, taskIdMap);
        if (resolved) dueDate.push(resolved);
      }
    }

    return { conditionalRules: conditional, dueDateRules: dueDate };
  }, [rawRules, widgets]);

  // Build hidden_by_default map from widgets and tasks
  const hiddenByDefault: IHiddenByDefaultMap = useMemo(() => {
    const map: IHiddenByDefaultMap = new Map();
    for (const w of widgets) {
      if (w.ps_group_id) {
        map.set(w.ps_group_id, w.hidden_by_default);
      }
    }
    for (const t of tasks) {
      if (t.template_task_id) {
        const templateTask = tasks.find(tt => tt.template_task_id === t.template_task_id);
        if (templateTask && !templateTask.is_visible) {
          map.set(t.template_task_id, true);
        }
      }
    }
    return map;
  }, [widgets, tasks]);

  // Initialize field values store when data loads
  useEffect(() => {
    if (!fvLoading && !rulesLoading && fieldValues.length >= 0 && projectId) {
      initFieldValues({
        projectId,
        fieldValues,
        rules: conditionalRules,
        hiddenByDefault,
      });
    }

    return () => resetFieldValues();
  }, [projectId, fvLoading, rulesLoading, fieldValues, conditionalRules, hiddenByDefault, initFieldValues, resetFieldValues]);

  // Auto-select first task when tasks load
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const firstVisible = tasks.find(t => t.is_visible);
      if (firstVisible) {
        selectTask(firstVisible.id);
      }
    }
  }, [tasks, selectedTaskId, selectTask]);

  // Compute due dates
  const projectStartDate = project?.start_date ? new Date(project.start_date) : null;
  const computedDueDates = useTaskDueDates(dueDateRules, projectStartDate);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  const isLoading = projectLoading || tasksLoading || fvLoading || widgetsLoading || rulesLoading;

  if (isLoading) {
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
      {/* Project header bar */}
      <div className={styles.headerBar}>
        <Button
          size="sm"
          variant="subtle"
          icon={<ArrowLeftIcon size={16} />}
          onClick={backToList}
        >
          Projects
        </Button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{project.merchant_name}</h1>
          <Badge color={STATUS_COLORS[project.status]}>
            {STATUS_LABELS[project.status]}
          </Badge>
          <span className={styles.meta}>#{project.merchant_id}</span>
          {project.platform && (
            <span className={styles.meta}>{project.platform}</span>
          )}
        </div>
      </div>

      {/* Split pane */}
      <div className={styles.splitPane}>
        <TaskListPanel
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          dueDates={computedDueDates}
          onUpdate={updateTask}
        />

        {selectedTask ? (
          <TaskDetailPanel
            task={selectedTask}
            widgets={widgets}
            computedDueDate={computedDueDates.get(selectedTask.id) ?? null}
            onUpdate={updateTask}
          />
        ) : (
          <div className={styles.emptyDetail}>
            Select a task to view its details
          </div>
        )}
      </div>
    </div>
  );
}
