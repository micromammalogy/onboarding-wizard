'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Button } from '@zonos/amino/components/button/Button';
import type { ITemplate, ITemplateTask, ITemplateWidget, ITemplateRule } from '@/types/database';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TemplateEditorPage } from './template-editor/TemplateEditorPage';
import styles from './TemplateListPage.module.scss';

type ITemplateWithTasks = ITemplate & {
  template_tasks: ITemplateTask[];
};

type ITemplateDetailData = {
  template: ITemplateWithTasks;
  widgets: ITemplateWidget[];
  rules: ITemplateRule[];
};

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const json = await res.json();
  return json.data;
}

function TemplateDetail({ templateId }: { templateId: string }) {
  const { data: template, isLoading: tLoading } = useSWR<ITemplateWithTasks>(
    `/api/db/templates/${templateId}`,
    () => fetcher<ITemplateWithTasks>(`/api/db/templates/${templateId}`),
    { revalidateOnFocus: false },
  );
  const { data: widgets } = useSWR<ITemplateWidget[]>(
    template ? `/api/db/template-widgets?template_id=${templateId}` : null,
    () => fetcher<ITemplateWidget[]>(`/api/db/template-widgets?template_id=${templateId}`),
    { revalidateOnFocus: false },
  );
  const { data: rules } = useSWR<ITemplateRule[]>(
    template ? `/api/db/template-rules?template_id=${templateId}` : null,
    () => fetcher<ITemplateRule[]>(`/api/db/template-rules?template_id=${templateId}`),
    { revalidateOnFocus: false },
  );

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

  const widgetsByTask = useMemo(() => {
    if (!widgets) return new Map<string, ITemplateWidget[]>();
    const map = new Map<string, ITemplateWidget[]>();
    for (const w of widgets) {
      const existing = map.get(w.template_task_id) || [];
      existing.push(w);
      map.set(w.template_task_id, existing);
    }
    return map;
  }, [widgets]);

  const conditionalCount = rules?.filter(r => r.rule_type === 'conditional').length ?? 0;
  const dueDateCount = rules?.filter(r => r.rule_type === 'due_date').length ?? 0;
  const assignmentCount = rules?.filter(r => r.rule_type === 'assignment').length ?? 0;

  if (tLoading) return <LoadingState message="Loading template..." />;
  if (!template) return <ErrorState message="Template not found" />;

  const totalTasks = template.template_tasks.filter(t => t.task_type !== 'section_header').length;
  const hiddenTasks = template.template_tasks.filter(t => t.hidden_by_default && t.task_type !== 'section_header').length;

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.detailTitle}>{template.name}</h2>
        {template.description && (
          <p className={styles.detailDesc}>{template.description}</p>
        )}
        <div className={styles.detailStats}>
          <Badge color="blue">{totalTasks} tasks</Badge>
          <Badge color="gray">{hiddenTasks} hidden by default</Badge>
          <Badge color="purple">{conditionalCount} conditional rules</Badge>
          <Badge color="cyan">{dueDateCount} due date rules</Badge>
          <Badge color="orange">{assignmentCount} assignment rules</Badge>
          <Badge color="green">{widgets?.length ?? 0} widgets</Badge>
        </div>
      </div>

      <div className={styles.detailSections}>
        {sections.map(([title, tasks]) => (
          <div key={title} className={styles.templateSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>{title}</span>
              <span className={styles.sectionCount}>{tasks.length} tasks</span>
            </div>
            <div className={styles.sectionTasks}>
              {tasks.map(task => {
                const taskWidgets = widgetsByTask.get(task.id) || [];
                const formFields = taskWidgets.filter(w => w.key);
                const contentWidgets = taskWidgets.filter(w => !w.key);
                return (
                  <div key={task.id} className={styles.templateTask}>
                    <div className={styles.taskRow}>
                      <span className={styles.taskTitle}>{task.title}</span>
                      <div className={styles.taskMeta}>
                        {task.hidden_by_default && (
                          <Badge color="gray" size="small">Hidden</Badge>
                        )}
                        {task.is_stop_gate && (
                          <Badge color="red" size="small">Stop Gate</Badge>
                        )}
                        <Badge
                          color={task.assignee_type === 'merchant' ? 'orange' : 'blue'}
                          size="small"
                        >
                          {task.assignee_type === 'merchant' ? 'Merchant' : 'OB Rep'}
                        </Badge>
                        {formFields.length > 0 && (
                          <span className={styles.widgetCount}>
                            {formFields.length} field{formFields.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {contentWidgets.length > 0 && (
                          <span className={styles.widgetCount}>
                            {contentWidgets.length} content
                          </span>
                        )}
                      </div>
                    </div>
                    {formFields.length > 0 && (
                      <div className={styles.fieldList}>
                        {formFields.sort((a, b) => a.order_index - b.order_index).map(w => (
                          <div key={w.id} className={styles.fieldItem}>
                            <span className={styles.fieldLabel}>
                              {w.label || w.key}
                              {w.is_required && <span className={styles.required}> *</span>}
                            </span>
                            <span className={styles.fieldType}>{w.widget_type}</span>
                            {Array.isArray(w.options) && w.options.length > 0 && (
                              <span className={styles.fieldOptions}>
                                {(w.options as Array<{value: string}>).map(o => o.value).join(', ')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TemplateListPage() {
  const { data: templates, error, isLoading, mutate } = useSWR<ITemplate[]>(
    '/api/db/templates',
    () => fetcher<ITemplate[]>('/api/db/templates'),
    { revalidateOnFocus: false },
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  if (isLoading) return <LoadingState message="Loading templates..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;

  if (editingId) {
    return (
      <div className={styles.container}>
        <TemplateEditorPage
          templateId={editingId}
          onBack={() => setEditingId(null)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Templates</h1>
        <p className={styles.subtitle}>
          {templates?.length ?? 0} template{(templates?.length ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className={styles.templateList}>
        {templates?.map(t => (
          <div
            key={t.id}
            className={`${styles.templateCard} ${selectedId === t.id ? styles.templateCardActive : ''}`}
            onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{t.name}</span>
              <div className={styles.cardActions}>
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={e => { e.stopPropagation(); setEditingId(t.id); }}
                >
                  Edit
                </Button>
                <Badge color={t.is_active ? 'green' : 'gray'}>
                  {t.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
            {t.description && (
              <p className={styles.cardDesc}>{t.description}</p>
            )}
          </div>
        ))}
      </div>

      {selectedId && <TemplateDetail templateId={selectedId} />}
    </div>
  );
}
