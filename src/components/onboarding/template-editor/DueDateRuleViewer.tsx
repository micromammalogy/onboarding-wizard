'use client';

import { useMemo } from 'react';
import { Badge } from '@zonos/amino/components/badge/Badge';
import type { ITemplateTask, ITemplateWidget, ITemplateRule } from '@/types/database';
import styles from './DueDateRuleViewer.module.scss';

type IDueDateRuleViewerProps = {
  rules: ITemplateRule[];
  allTasks: ITemplateTask[];
  allWidgets: ITemplateWidget[];
};

export function DueDateRuleViewer({ rules, allTasks, allWidgets }: IDueDateRuleViewerProps) {
  const enrichedRules = useMemo(() => {
    return rules.map(rule => {
      const targetTask = allTasks.find(t => t.id === rule.target_task_ids?.[0]);
      const sourceWidget = rule.due_date_source_widget_key
        ? allWidgets.find(w => w.key === rule.due_date_source_widget_key)
        : null;

      return {
        ...rule,
        targetTaskName: targetTask?.title ?? '(unknown task)',
        sourceName: rule.due_date_source === 'checklist_start'
          ? 'Project start date'
          : sourceWidget?.label ?? rule.due_date_source_widget_key ?? '(unknown field)',
      };
    });
  }, [rules, allTasks, allWidgets]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Due Date Rules ({rules.length})</h3>
      <div className={styles.ruleList}>
        {enrichedRules.map(rule => (
          <div key={rule.id} className={styles.ruleCard}>
            <div className={styles.ruleTarget}>
              <Badge color="cyan" size="small">DUE DATE</Badge>
              <span className={styles.taskName}>{rule.targetTaskName}</span>
            </div>
            <div className={styles.ruleFormula}>
              <span className={styles.offset}>
                {rule.due_date_offset_value} {rule.due_date_offset_unit}
              </span>
              <span className={styles.direction}>
                {rule.due_date_direction}
              </span>
              <span className={styles.source}>
                {rule.sourceName}
              </span>
              {rule.due_date_workdays_only && (
                <Badge color="gray" size="small">Business days</Badge>
              )}
            </div>
          </div>
        ))}
        {rules.length === 0 && (
          <div className={styles.empty}>No due date rules defined</div>
        )}
      </div>
    </div>
  );
}
