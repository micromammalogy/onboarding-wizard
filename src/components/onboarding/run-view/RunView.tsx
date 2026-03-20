'use client';

import { useEffect, useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { ArrowLeftIcon } from '@zonos/amino/icons/ArrowLeftIcon';
import { useProject, useTasks, useFieldValuesData, useAllTemplateWidgets, useTemplateRules } from '@/hooks/useSupabase';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useFieldValues } from '@/hooks/useFieldValues';
import { useTaskDueDates } from '@/hooks/useTaskDueDates';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RunProgressBar } from '@/components/onboarding/RunProgressBar';
import { RunTaskList } from './RunTaskList';
import { RunContentPanel } from './RunContentPanel';
import { toResolvedConditionalRule, toResolvedDueDateRule } from '@/lib/rules/types';
import type { IResolvedConditionalRule, IResolvedDueDateRule, IHiddenByDefaultMap } from '@/lib/rules/types';
import styles from './RunView.module.scss';

type IRunViewProps = {
  projectId: string;
};

const COMPLETE_STATUSES = ['complete', 'ob_verified', 'merchant_complete'];

export function RunView({ projectId }: IRunViewProps) {
  const { project, isLoading: projectLoading, error: projectError, mutate: mutateProject } = useProject(projectId);
  const { tasks, isLoading: tasksLoading, error: tasksError, mutate: mutateTasks, updateTask } = useTasks(projectId);
  const { fieldValues, isLoading: fvLoading } = useFieldValuesData(projectId);
  const { widgets } = useAllTemplateWidgets(project?.template_id ?? null);
  const { rules: rawRules, isLoading: rulesLoading } = useTemplateRules(project?.template_id ?? null);

  const selectedTaskId = useOnboardingNavStore(s => s.selectedTaskId);
  const selectTask = useOnboardingNavStore(s => s.selectTask);
  const openProject = useOnboardingNavStore(s => s.openProject);

  const initFieldValues = useFieldValues(s => s.init);
  const resetFieldValues = useFieldValues(s => s.reset);
  const isVisible = useFieldValues(s => s.isVisible);

  // Resolve rules (same logic as ProjectDetailPage)
  const { conditionalRules, dueDateRules } = useMemo(() => {
    const widgetKeyToId = new Map<string, string>();
    const psGroupIdToKey = new Map<string, string>();
    for (const w of widgets) {
      if (w.key && w.ps_group_id) {
        widgetKeyToId.set(w.key, w.ps_group_id);
        psGroupIdToKey.set(w.ps_group_id, w.key);
      }
    }

    const taskIdMap = new Map<string, string>();
    const conditional: IResolvedConditionalRule[] = [];
    const dueDate: IResolvedDueDateRule[] = [];

    for (const rule of rawRules) {
      if (rule.rule_type === 'conditional') {
        const resolved = toResolvedConditionalRule(rule, widgetKeyToId, psGroupIdToKey);
        if (resolved) conditional.push(resolved);
      } else if (rule.rule_type === 'due_date') {
        const resolved = toResolvedDueDateRule(rule, taskIdMap);
        if (resolved) dueDate.push(resolved);
      }
    }

    return { conditionalRules: conditional, dueDateRules: dueDate };
  }, [rawRules, widgets]);

  // Build hidden_by_default map
  const hiddenByDefault: IHiddenByDefaultMap = useMemo(() => {
    const map: IHiddenByDefaultMap = new Map();
    for (const w of widgets) {
      if (w.ps_group_id) {
        map.set(w.ps_group_id, w.hidden_by_default);
      }
    }
    for (const t of tasks) {
      if (t.template_task_id) {
        const visible = 'is_visible' in t ? t.is_visible : true;
        if (!visible) {
          map.set(t.template_task_id, true);
        }
      }
    }
    return map;
  }, [widgets, tasks]);

  // Initialize field values store
  useEffect(() => {
    if (!fvLoading && !rulesLoading && projectId) {
      initFieldValues({
        projectId,
        fieldValues,
        rules: conditionalRules,
        hiddenByDefault,
      });
    }
    return () => resetFieldValues();
  }, [projectId, fvLoading, rulesLoading, fieldValues, conditionalRules, hiddenByDefault, initFieldValues, resetFieldValues]);

  // Auto-select first task
  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      const firstVisible = tasks.find(t => isVisible(t.template_task_id ?? t.id));
      if (firstVisible) {
        selectTask(firstVisible.id);
      }
    }
  }, [tasks, selectedTaskId, selectTask, isVisible]);

  // Compute due dates
  const projectStartDate = project?.start_date ? new Date(project.start_date) : null;
  const rawDueDates = useTaskDueDates(dueDateRules, projectStartDate);

  const computedDueDates = useMemo(() => {
    if (rawDueDates.size === 0) return rawDueDates;
    const mapped = new Map<string, Date>();
    for (const t of tasks) {
      if (t.template_task_id) {
        const date = rawDueDates.get(t.template_task_id);
        if (date) mapped.set(t.id, date);
      }
    }
    return mapped;
  }, [rawDueDates, tasks]);

  // Task badge data
  const taskBadges = useMemo(() => {
    const emailTaskIds = new Set<string>();
    const conditionalTaskIds = new Set<string>();
    const dueDateTaskIds = new Set<string>();

    for (const w of widgets) {
      if (w.widget_type === 'send_rich_email') {
        emailTaskIds.add(w.template_task_id);
      }
    }
    for (const rule of rawRules) {
      if (rule.rule_type === 'conditional') {
        for (const tid of rule.target_task_ids) {
          conditionalTaskIds.add(tid);
        }
      } else if (rule.rule_type === 'due_date') {
        for (const tid of rule.target_task_ids) {
          dueDateTaskIds.add(tid);
        }
      }
    }

    return { emailTaskIds, conditionalTaskIds, dueDateTaskIds };
  }, [widgets, rawRules]);

  // Progress
  const totalCompleted = tasks.filter(t => {
    const vid = t.template_task_id ?? t.id;
    return isVisible(vid) && COMPLETE_STATUSES.includes(t.status);
  }).length;
  const totalVisible = tasks.filter(t => isVisible(t.template_task_id ?? t.id)).length;

  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;

  if (projectLoading || tasksLoading) {
    return <LoadingState message="Loading run..." />;
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
      {/* Back to editor bar */}
      <div className={styles.topBar}>
        <Button
          size="sm"
          variant="subtle"
          icon={<ArrowLeftIcon size={16} />}
          onClick={() => openProject(projectId)}
        >
          Back to editor
        </Button>
        <span className={styles.topBarTitle}>{project.merchant_name}</span>
      </div>

      {/* Progress bar */}
      <RunProgressBar
        completedTasks={totalCompleted}
        totalTasks={totalVisible}
      />

      {/* Split pane */}
      <div className={styles.splitPane}>
        <RunTaskList
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          dueDates={computedDueDates}
          projectId={projectId}
          projectName={project.merchant_name}
          taskBadges={taskBadges}
          onUpdate={updateTask}
        />

        {selectedTask ? (
          <RunContentPanel
            task={selectedTask}
            widgets={widgets}
            computedDueDate={computedDueDates.get(selectedTask.id) ?? null}
            onUpdate={updateTask}
          />
        ) : (
          <div className={styles.emptyContent}>
            Select a task to begin
          </div>
        )}
      </div>
    </div>
  );
}
