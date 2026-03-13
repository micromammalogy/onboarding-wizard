'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import type { ITemplateTask, ITemplateWidget, ITemplateRule, IConditionOperator, IRuleAction } from '@/types/database';
import styles from './ConditionalRuleEditor.module.scss';

type IConditionalRuleEditorProps = {
  rules: ITemplateRule[];
  allTasks: ITemplateTask[];
  allWidgets: ITemplateWidget[];
  onAdd: (rule: Partial<ITemplateRule>) => Promise<void>;
  onUpdate: (ruleId: string, updates: Partial<ITemplateRule>) => Promise<void>;
  onDelete: (ruleId: string) => Promise<void>;
};

const OPERATOR_OPTIONS = [
  { value: 'is', label: 'is' },
  { value: 'is_not', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'has_no_value', label: 'has no value' },
];

const ACTION_OPTIONS = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
];

export function ConditionalRuleEditor({
  rules,
  allTasks,
  allWidgets,
  onAdd,
  onUpdate,
  onDelete,
}: IConditionalRuleEditorProps) {
  const [adding, setAdding] = useState(false);
  const [newRule, setNewRule] = useState({
    triggerField: '',
    operator: 'is' as IConditionOperator,
    value: '',
    action: 'show' as IRuleAction,
    targetTaskIds: [] as string[],
    targetWidgetIds: [] as string[],
  });

  const fieldOptions = useMemo(() => {
    return allWidgets
      .filter(w => w.key && ['select', 'multi_select', 'multi_choice', 'text'].includes(w.widget_type))
      .map(w => ({ value: w.key!, label: w.label || w.key! }));
  }, [allWidgets]);

  const taskOptions = useMemo(() => {
    return allTasks
      .filter(t => t.task_type !== 'section_header')
      .map(t => ({ value: t.id, label: t.title }));
  }, [allTasks]);

  const selectedFieldOptions = useMemo(() => {
    if (!newRule.triggerField) return [];
    const widget = allWidgets.find(w => w.key === newRule.triggerField);
    if (!widget || !Array.isArray(widget.options)) return [];
    return (widget.options as Array<{ value: string }>).map(o => ({
      value: o.value,
      label: o.value,
    }));
  }, [newRule.triggerField, allWidgets]);

  const handleCreate = useCallback(async () => {
    if (!newRule.triggerField) return;

    await onAdd({
      rule_type: 'conditional',
      action: newRule.action,
      target_task_ids: newRule.targetTaskIds,
      target_widget_ids: newRule.targetWidgetIds,
      compound_conditions: {
        logic: 'or',
        conditions: [{
          logic: 'and',
          conditions: [{
            widget_key: newRule.triggerField,
            operator: newRule.operator,
            value: newRule.value || null,
          }],
        }],
      },
      metadata: {},
    });

    setAdding(false);
    setNewRule({
      triggerField: '',
      operator: 'is',
      value: '',
      action: 'show',
      targetTaskIds: [],
      targetWidgetIds: [],
    });
  }, [newRule, onAdd]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Conditional Rules</h3>
        <Button
          size="sm"
          icon={<PlusIcon size={12} />}
          onClick={() => setAdding(true)}
        >
          Add Rule
        </Button>
      </div>

      {adding && (
        <div className={styles.newRule}>
          <h4 className={styles.newRuleTitle}>New Conditional Rule</h4>
          <div className={styles.ruleBuilder}>
            <div className={styles.ruleRow}>
              <span className={styles.ruleLabel}>IF</span>
              <Select
                value={fieldOptions.find(o => o.value === newRule.triggerField) ?? null}
                options={fieldOptions}
                onChange={opt => setNewRule(prev => ({ ...prev, triggerField: String(opt?.value ?? '') }))}
                placeholder="Select field..."
                size="sm"
              />
              <Select
                value={OPERATOR_OPTIONS.find(o => o.value === newRule.operator) ?? null}
                options={OPERATOR_OPTIONS}
                onChange={opt => setNewRule(prev => ({ ...prev, operator: String(opt?.value ?? 'is') as IConditionOperator }))}
                size="sm"
              />
              {newRule.operator !== 'has_no_value' && (
                selectedFieldOptions.length > 0 ? (
                  <Select
                    value={selectedFieldOptions.find(o => o.value === newRule.value) ?? null}
                    options={selectedFieldOptions}
                    onChange={opt => setNewRule(prev => ({ ...prev, value: String(opt?.value ?? '') }))}
                    placeholder="Select value..."
                    size="sm"
                  />
                ) : (
                  <input
                    className={styles.valueInput}
                    value={newRule.value}
                    onChange={e => setNewRule(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value..."
                  />
                )
              )}
            </div>
            <div className={styles.ruleRow}>
              <span className={styles.ruleLabel}>THEN</span>
              <Select
                value={ACTION_OPTIONS.find(o => o.value === newRule.action) ?? null}
                options={ACTION_OPTIONS}
                onChange={opt => setNewRule(prev => ({ ...prev, action: String(opt?.value ?? 'show') as IRuleAction }))}
                size="sm"
              />
              <Select
                value={taskOptions.filter(o => newRule.targetTaskIds.includes(o.value))}
                options={taskOptions}
                onChange={(opt) => {
                  if (opt) {
                    const val = String((opt as { value: string }).value);
                    setNewRule(prev => ({
                      ...prev,
                      targetTaskIds: prev.targetTaskIds.includes(val)
                        ? prev.targetTaskIds.filter(id => id !== val)
                        : [...prev.targetTaskIds, val],
                    }));
                  }
                }}
                placeholder="Select target task(s)..."
                size="sm"
              />
            </div>
            <div className={styles.ruleActions}>
              <Button size="sm" onClick={handleCreate}>Create Rule</Button>
              <Button size="sm" variant="subtle" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.ruleList}>
        {rules.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            allWidgets={allWidgets}
            allTasks={allTasks}
            onDelete={onDelete}
          />
        ))}
        {rules.length === 0 && (
          <div className={styles.empty}>No conditional rules defined</div>
        )}
      </div>
    </div>
  );
}

function RuleCard({
  rule,
  allWidgets,
  allTasks,
  onDelete,
}: {
  rule: ITemplateRule;
  allWidgets: ITemplateWidget[];
  allTasks: ITemplateTask[];
  onDelete: (id: string) => Promise<void>;
}) {
  const conditions = rule.compound_conditions?.conditions ?? [];

  const targetNames = useMemo(() => {
    const taskNames = (rule.target_task_ids ?? [])
      .map(id => allTasks.find(t => t.id === id)?.title ?? id)
      .slice(0, 3);
    const widgetTargetIds = rule.target_widget_ids?.length
      ? rule.target_widget_ids
      : ((rule.metadata as Record<string, unknown>)?.targetWidgetGroupIds as string[]) ?? [];
    const widgetNames = widgetTargetIds
      .map(id => allWidgets.find(w => w.ps_group_id === id || w.id === id)?.label ?? id)
      .slice(0, 3);
    return [...taskNames, ...widgetNames];
  }, [rule, allTasks, allWidgets]);

  return (
    <div className={styles.ruleCard}>
      <div className={styles.ruleCardHeader}>
        <Badge color={rule.action === 'show' ? 'green' : 'red'} size="small">
          {rule.action?.toUpperCase()}
        </Badge>
        <span className={styles.ruleCardTargets}>
          {targetNames.length > 0
            ? targetNames.join(', ')
            : '(no targets)'
          }
          {(rule.target_task_ids?.length ?? 0) + ((rule.metadata as Record<string, unknown>)?.targetWidgetGroupIds as string[] ?? []).length > 3 && '...'}
        </span>
        <button
          className={styles.ruleDeleteButton}
          onClick={() => onDelete(rule.id)}
          title="Delete rule"
        >
          <RemoveCircleIcon size={14} />
        </button>
      </div>
      <div className={styles.ruleCardConditions}>
        {conditions.map((orGroup, gi) => (
          <div key={gi} className={styles.conditionGroup}>
            {gi > 0 && <span className={styles.logicOp}>OR</span>}
            {orGroup.conditions.map((cond, ci) => {
              const widget = allWidgets.find(w => w.key === cond.widget_key);
              return (
                <span key={ci} className={styles.condition}>
                  {ci > 0 && <span className={styles.logicOp}>AND</span>}
                  <strong>{widget?.label || cond.widget_key}</strong>
                  {' '}{cond.operator}{' '}
                  {cond.value ? `"${cond.value}"` : '(no value)'}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
