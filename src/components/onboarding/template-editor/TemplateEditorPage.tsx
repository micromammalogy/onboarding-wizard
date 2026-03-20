'use client';

import { useState, useMemo, useCallback } from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Select } from '@zonos/amino/components/select/Select';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import { ArrowUpIcon } from '@zonos/amino/icons/ArrowUpIcon';
import { ArrowDownIcon } from '@zonos/amino/icons/ArrowDownIcon';
import type { ITemplate, ITemplateTask, ITemplateWidget, ITemplateRule, ITriggerType } from '@/types/database';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TaskEditor } from './TaskEditor';
import { ConditionalRuleEditor } from './ConditionalRuleEditor';
import { DueDateRuleViewer } from './DueDateRuleViewer';
import { FocusBar } from './FocusBar';
import { InsertWidgetDrawer } from './InsertWidgetDrawer';
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
  const [activeTab, setActiveTab] = useState<'tasks' | 'rules' | 'due-dates' | 'triggers'>('tasks');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(true);

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

  const handleFocusBarNameChange = useCallback(async (name: string) => {
    await fetch(`/api/db/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    mutateTemplate();
  }, [templateId, mutateTemplate]);

  const handleDrawerWidgetAdd = useCallback((widgetType: string) => {
    if (selectedTaskId) {
      handleWidgetAdd(selectedTaskId, widgetType);
    }
  }, [selectedTaskId, handleWidgetAdd]);

  return (
    <div className={styles.container}>
      {/* FocusBar replaces old topBar + tabs */}
      <FocusBar
        templateName={template.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onBack={onBack}
        onNameChange={handleFocusBarNameChange}
        stats={{
          taskCount: totalTasks,
          ruleCount: conditionalRules.length,
          widgetCount: widgets?.length ?? 0,
        }}
      />

      {/* Cover image */}
      <div className={styles.coverImageSection}>
        {template.cover_image_url ? (
          <div className={styles.coverImagePreview}>
            <img src={template.cover_image_url} alt="Cover" className={styles.coverImage} />
            <Button
              size="sm"
              variant="subtle"
              onClick={async () => {
                await fetch(`/api/db/templates/${templateId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ cover_image_url: null }),
                });
                mutateTemplate();
              }}
            >
              Remove cover
            </Button>
          </div>
        ) : (
          <CoverImageUpload
            onUpload={async (url) => {
              await fetch(`/api/db/templates/${templateId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cover_image_url: url }),
              });
              mutateTemplate();
            }}
          />
        )}
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

          {/* Insert Widget Drawer */}
          <InsertWidgetDrawer
            isOpen={drawerOpen}
            onToggle={() => setDrawerOpen(!drawerOpen)}
            onWidgetAdd={handleDrawerWidgetAdd}
          />
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

      {activeTab === 'triggers' && (
        <TriggersPanel
          triggerConfig={template.trigger_config ?? { type: 'manual' }}
          onUpdate={async (config) => {
            await fetch(`/api/db/templates/${templateId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ trigger_config: config }),
            });
            mutateTemplate();
          }}
        />
      )}
    </div>
  );
}

function CoverImageUpload({ onUpload }: { onUpload: (url: string) => Promise<void> }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', 'templates');
    const res = await fetch('/api/db/files', { method: 'POST', body: formData });
    const json = await res.json();
    if (json.data?.url) {
      await onUpload(json.data.url);
    }
    setUploading(false);
  };

  return (
    <label className={styles.coverUploadButton}>
      <input
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? 'Uploading...' : 'Add cover image'}
    </label>
  );
}

const TRIGGER_TYPE_OPTIONS = [
  { value: 'manual', label: 'Manual — Start projects by hand' },
  { value: 'salesforce', label: 'Salesforce — Triggered by opportunity stage change' },
  { value: 'api', label: 'API — Triggered by external webhook' },
  { value: 'scheduled', label: 'Scheduled — Runs on a cron schedule' },
];

function TriggersPanel({
  triggerConfig,
  onUpdate,
}: {
  triggerConfig: { type: string; source?: string | null; schedule?: string | null };
  onUpdate: (config: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <div className={styles.triggersPanel}>
      <h3 className={styles.triggersPanelTitle}>Workflow Triggers</h3>
      <p className={styles.triggersPanelDesc}>
        Configure what starts a new project from this template.
      </p>

      <div className={styles.triggerOptions}>
        {TRIGGER_TYPE_OPTIONS.map(opt => {
          const isActive = triggerConfig.type === opt.value;
          return (
            <div
              key={opt.value}
              className={`${styles.triggerOption} ${isActive ? styles.triggerOptionActive : ''}`}
              onClick={() => onUpdate({ type: opt.value })}
            >
              <div className={styles.triggerRadio}>
                <div className={`${styles.radioCircle} ${isActive ? styles.radioActive : ''}`} />
              </div>
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>

      {triggerConfig.type === 'salesforce' && (
        <div className={styles.triggerConfigSection}>
          <Badge color="orange" size="small">Coming soon</Badge>
          <p className={styles.triggerConfigNote}>
            Salesforce integration will auto-create projects when an opportunity reaches a configured stage.
          </p>
        </div>
      )}
      {triggerConfig.type === 'api' && (
        <div className={styles.triggerConfigSection}>
          <Badge color="blue" size="small">Available</Badge>
          <p className={styles.triggerConfigNote}>
            Send a POST to <code>/api/webhooks/create-project</code> with template_id and merchant details to auto-create projects.
          </p>
        </div>
      )}
      {triggerConfig.type === 'scheduled' && (
        <div className={styles.triggerConfigSection}>
          <Badge color="purple" size="small">Coming soon</Badge>
          <p className={styles.triggerConfigNote}>
            Scheduled triggers will run on a cron schedule to batch-create projects.
          </p>
        </div>
      )}
    </div>
  );
}
