'use client';

import type { ITask, ITaskUpdate, ITemplateWidget } from '@/types/database';
import { FormFieldRenderer } from '../form-fields/FormFieldRenderer';
import { TaskComments } from '../task-detail/TaskComments';
import { ActivityFeed } from '../task-detail/ActivityFeed';
import styles from './RunContentPanel.module.scss';

type IRunContentPanelProps = {
  task: ITask;
  widgets: ITemplateWidget[];
  computedDueDate?: Date | null;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
};

// Mock audit trail data — in future, each widget's last edit info from the API
function getWidgetAudit(_widgetId: string): { user: string; date: string } | null {
  // Return mock data for demo; null means no audit trail yet
  const mockAudits: Record<number, { user: string; date: string }> = {
    0: { user: 'Jane Kim', date: 'Mar 12, 2026' },
    1: { user: 'Shawn Roah', date: 'Mar 14, 2026' },
  };
  // Use a hash of the widgetId to deterministically pick an audit
  let hash = 0;
  for (let i = 0; i < _widgetId.length; i++) {
    hash = _widgetId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % 4;
  return mockAudits[idx] ?? null;
}

export function RunContentPanel({
  task,
  widgets,
  onUpdate,
}: IRunContentPanelProps) {
  const taskWidgets = widgets
    .filter(w => w.template_task_id === task.template_task_id)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <h2 className={styles.taskName}>{task.title}</h2>

        {task.description && (
          <p className={styles.taskDescription}>{task.description}</p>
        )}

        {taskWidgets.length > 0 && (
          <div className={styles.fields}>
            {taskWidgets.map(widget => (
              <div key={widget.id} className={styles.fieldWrapper}>
                <FormFieldRenderer
                  widget={widget}
                  taskId={task.id}
                />
                {(() => {
                  const audit = getWidgetAudit(widget.id);
                  if (!audit) return null;
                  return (
                    <div className={styles.auditTrail}>
                      Updated by {audit.user} on {audit.date}
                    </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {taskWidgets.length === 0 && (
          <div className={styles.emptyFields}>
            No form fields for this task.
          </div>
        )}

        <TaskComments taskId={task.id} />

        <ActivityFeed taskId={task.id} />
      </div>
    </div>
  );
}
