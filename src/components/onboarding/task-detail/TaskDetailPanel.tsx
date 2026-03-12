'use client';

import type { ITask, ITaskUpdate, ITemplateWidget } from '@/types/database';
import { TaskHeader } from './TaskHeader';
import { FormFieldRenderer } from '../form-fields/FormFieldRenderer';
import styles from './TaskDetailPanel.module.scss';

type ITaskDetailPanelProps = {
  task: ITask;
  widgets: ITemplateWidget[];
  computedDueDate?: Date | null;
  onUpdate: (taskId: string, updates: ITaskUpdate) => Promise<unknown>;
  onDelete?: (taskId: string) => Promise<void>;
};

export function TaskDetailPanel({
  task,
  widgets,
  computedDueDate,
  onUpdate,
  onDelete,
}: ITaskDetailPanelProps) {
  // Filter and sort widgets for this task
  const taskWidgets = widgets
    .filter(w => w.template_task_id === task.template_task_id)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className={styles.panel}>
      <TaskHeader
        task={task}
        computedDueDate={computedDueDate}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      {taskWidgets.length > 0 && (
        <div className={styles.fields}>
          {taskWidgets.map(widget => (
            <FormFieldRenderer
              key={widget.id}
              widget={widget}
              taskId={task.id}
            />
          ))}
        </div>
      )}

      {taskWidgets.length === 0 && (
        <div className={styles.emptyFields}>
          No form fields for this task.
        </div>
      )}
    </div>
  );
}
