'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Select } from '@zonos/amino/components/select/Select';
import { ChevronLeftIcon } from '@zonos/amino/icons/ChevronLeftIcon';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import { ArrowUpIcon } from '@zonos/amino/icons/ArrowUpIcon';
import { ArrowDownIcon } from '@zonos/amino/icons/ArrowDownIcon';
import type { ITemplate, ITemplateTask, ITemplateWidget, ITemplateRule } from '@/types/database';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TaskEditor } from './TaskEditor';
import { ConditionalRuleEditor } from './ConditionalRuleEditor';
import { DueDateRuleViewer } from './DueDateRuleViewer';
import styles from './TemplateEditorPage.module.scss';

type ITemplateWithTasks = ITemplate & {
  template_tasks: ITemplateTask[];
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const json = await res.json();
  return json.data;
}

type ITemplateEditorPageProps = {
  templateId: string;
  onBack: () => void;
};

export function TemplateEditorPage({ templateId, onBack }: ITemplateEditorPageProps) {
  const { data: template, isLoading: tLoading, mutate: mutateTemplate } = useSWR<ITemplateWithTasks>(
    `/api/db/templates/${templateId}`,
    () => fetcher<ITemplateWithTasks>(`/api/db/templates/${templateId}`),
  );
  const { data: widgets, mutate: mutateWidgets } = useSWR<ITemplateWidget[]>(
    template ? `/api/db/template-widgets?template_id=${templateId}` : null,
    () => fetcher<ITemplateWidget[]>(`/api/db/template-widgets?template_id=${templateId}`),
  );
  const { data: rules, mutate: mutateRules } = useSWR<ITemplateRule[]>(
    template ? `/api/db/template-rules?template_id=${templateId}` : null,
    () => fetcher<ITemplateRule[]>(`/api/db/template-rules?template_id=${templateId}`),
  );

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'rules' | 'due-dates'>('tasks');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');

  const sections = useMemo(() => {
    if (!template?.template_tasks) return [];
    const tasks = [...template.template_tasks].sort((a, b) => a.order_index - b.order_index);
    const grouped = new Map<string, ITemplateTask[]>();
    for (const task of tasks) {
      if (task.task_type === 'section_header') continue;
      const section = task.section || 'Uncategorized';
      const existing = grouped.get(section) || [];
      existing.push(task);
      grouped.set(section, existing);
    }
    return Array.from(grouped.entries());
  }, [template]);

  const selectedTask = useMemo(() => {
    if (!selectedTaskId || !template) return null;
    return template.template_tasks.find(t => t.id === selectedTaskId) ?? null;
  }, [selectedTaskId, template]);

  const taskWidgets = useMemo(() => {
    if (!selectedTaskId || !widgets) return [];
    return widgets
      .filter(w => w.template_task_id === selectedTaskId)
      .sort((a, b) => a.order_index - b.order_index);
  }, [selectedTaskId, widgets]);

  const conditionalRules = useMemo(() => {
    return (rules ?? []).filter(r => r.rule_type === 'conditional');
  }, [rules]);

  const dueDateRules = useMemo(() => {
    return (rules ?? []).filter(r => r.rule_type === 'due_date');
  }, [rules]);

  const handleUpdateTemplateName = useCallback(async () => {
    if (!nameValue.trim()) return;
    await fetch(`/api/db/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameValue.trim() }),
    });
    mutateTemplate();
    setEditingName(false);
  }, [templateId, nameValue, mutateTemplate]);

  const handleAddTask = useCallback(async (section: string, afterIndex: number) => {
    const res = await fetch(`/api/db/templates/${templateId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: [{
          template_id: templateId,
          title: 'New task',
          section,
          order_index: afterIndex + 0.5,
          assignee_type: 'ob',
          due_date_type: 'fixed',
          task_type: 'standard',
          metadata: {},
          hidden_by_default: false,
          is_stop_gate: false,
        }],
      }),
    });
    const json = await res.json();
    mutateTemplate();
    if (json.data?.[0]?.id) {
      setSelectedTaskId(json.data[0].id);
    }
  }, [templateId, mutateTemplate]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await fetch(`/api/db/template-tasks/${taskId}`, { method: 'DELETE' });
    if (selectedTaskId === taskId) setSelectedTaskId(null);
    mutateTemplate();
  }, [selectedTaskId, mutateTemplate]);

  const handleMoveTask = useCallback(async (taskId: string, direction: 'up' | 'down') => {
    if (!template) return;
    const allTasks = [...template.template_tasks]
      .filter(t => t.task_type !== 'section_header')
      .sort((a, b) => a.order_index - b.order_index);
    const idx = allTasks.findIndex(t => t.id === taskId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= allTasks.length) return;

    const updates = [
      { id: allTasks[idx].id, order_index: allTasks[swapIdx].order_index },
      { id: allTasks[swapIdx].id, order_index: allTasks[idx].order_index },
    ];

    await fetch('/api/db/template-tasks/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updates }),
    });
    mutateTemplate();
  }, [template, mutateTemplate]);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<ITemplateTask>) => {
    await fetch(`/api/db/template-tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    mutateTemplate();
  }, [mutateTemplate]);

  const handleWidgetAdd = useCallback(async (taskId: string, widgetType: string) => {
    const maxOrder = taskWidgets.reduce((max, w) => Math.max(max, w.order_index), -1);
    await fetch('/api/db/template-widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_task_id: taskId,
        key: `new_${widgetType}_${Date.now()}`,
        label: `New ${widgetType} field`,
        widget_type: widgetType,
        order_index: maxOrder + 1,
        is_required: false,
        hidden_by_default: false,
        options: [],
        metadata: {},
      }),
    });
    mutateWidgets();
  }, [taskWidgets, mutateWidgets]);

  const handleWidgetUpdate = useCallback(async (widgetId: string, updates: Partial<ITemplateWidget>) => {
    await fetch(`/api/db/template-widgets/${widgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    mutateWidgets();
  }, [mutateWidgets]);

  const handleWidgetDelete = useCallback(async (widgetId: string) => {
    await fetch(`/api/db/template-widgets/${widgetId}`, { method: 'DELETE' });
    mutateWidgets();
  }, [mutateWidgets]);

  const handleRuleAdd = useCallback(async (rule: Partial<ITemplateRule>) => {
    await fetch('/api/db/template-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rule, template_id: templateId }),
    });
    mutateRules();
  }, [templateId, mutateRules]);

  const handleRuleUpdate = useCallback(async (ruleId: string, updates: Partial<ITemplateRule>) => {
    await fetch(`/api/db/template-rules/${ruleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    mutateRules();
  }, [mutateRules]);

  const handleRuleDelete = useCallback(async (ruleId: string) => {
    await fetch(`/api/db/template-rules/${ruleId}`, { method: 'DELETE' });
    mutateRules();
  }, [mutateRules]);

  if (tLoading) return <LoadingState message="Loading template..." />;
  if (!template) return <ErrorState message="Template not found" />;

  const totalTasks = template.template_tasks.filter(t => t.task_type !== 'section_header').length;

  return (
    <div className={styles.container}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeftIcon size={14} />
          Back to templates
        </button>
        <div className={styles.topBarActions}>
          <Badge color="blue">{totalTasks} tasks</Badge>
          <Badge color="purple">{conditionalRules.length} rules</Badge>
          <Badge color="cyan">{dueDateRules.length} due dates</Badge>
          <Badge color="green">{widgets?.length ?? 0} widgets</Badge>
        </div>
      </div>

      {/* Template name */}
      <div className={styles.templateHeader}>
        {editingName ? (
          <div className={styles.nameEdit}>
            <Input
              value={nameValue}
              onChange={e => setNameValue(e.target.value)}
              size="lg"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleUpdateTemplateName();
                if (e.key === 'Escape') setEditingName(false);
              }}
            />
            <Button size="sm" onClick={handleUpdateTemplateName}>Save</Button>
            <Button size="sm" variant="subtle" onClick={() => setEditingName(false)}>Cancel</Button>
          </div>
        ) : (
          <h1
            className={styles.templateName}
            onClick={() => { setEditingName(true); setNameValue(template.name); }}
            title="Click to edit"
          >
            {template.name}
          </h1>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks & Widgets
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'rules' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Conditional Rules ({conditionalRules.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'due-dates' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('due-dates')}
        >
          Due Dates ({dueDateRules.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className={styles.editorLayout}>
          {/* Task list sidebar */}
          <div className={styles.taskSidebar}>
            {sections.map(([title, tasks]) => (
              <div key={title} className={styles.sidebarSection}>
                <div className={styles.sidebarSectionHeader}>
                  <span>{title}</span>
                  <button
                    className={styles.addButton}
                    onClick={() => handleAddTask(title, tasks[tasks.length - 1]?.order_index ?? 0)}
                    title="Add task to this section"
                  >
                    <PlusIcon size={12} />
                  </button>
                </div>
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`${styles.sidebarTask} ${selectedTaskId === task.id ? styles.sidebarTaskActive : ''}`}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <span className={styles.sidebarTaskTitle}>{task.title}</span>
                    <div className={styles.sidebarTaskActions}>
                      {task.hidden_by_default && (
                        <span className={styles.hiddenDot} title="Hidden by default" />
                      )}
                      <button
                        className={styles.moveButton}
                        onClick={e => { e.stopPropagation(); handleMoveTask(task.id, 'up'); }}
                        title="Move up"
                      >
                        <ArrowUpIcon size={10} />
                      </button>
                      <button
                        className={styles.moveButton}
                        onClick={e => { e.stopPropagation(); handleMoveTask(task.id, 'down'); }}
                        title="Move down"
                      >
                        <ArrowDownIcon size={10} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        title="Delete task"
                      >
                        <RemoveCircleIcon size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Task editor panel */}
          <div className={styles.editorPanel}>
            {selectedTask ? (
              <TaskEditor
                task={selectedTask}
                widgets={taskWidgets}
                allWidgets={widgets ?? []}
                rules={rules ?? []}
                onTaskUpdate={handleTaskUpdate}
                onWidgetAdd={handleWidgetAdd}
                onWidgetUpdate={handleWidgetUpdate}
                onWidgetDelete={handleWidgetDelete}
              />
            ) : (
              <div className={styles.emptyEditor}>
                Select a task from the sidebar to edit it
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <ConditionalRuleEditor
          rules={conditionalRules}
          allTasks={template.template_tasks}
          allWidgets={widgets ?? []}
          onAdd={handleRuleAdd}
          onUpdate={handleRuleUpdate}
          onDelete={handleRuleDelete}
        />
      )}

      {activeTab === 'due-dates' && (
        <DueDateRuleViewer
          rules={dueDateRules}
          allTasks={template.template_tasks}
          allWidgets={widgets ?? []}
        />
      )}
    </div>
  );
}
