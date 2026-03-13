'use client';

import { useState, useCallback } from 'react';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Button } from '@zonos/amino/components/button/Button';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import type { ITemplateTask, ITemplateWidget, ITemplateRule, ITaskPermissionRole, IAutomationProvider, ITaskAutomation } from '@/types/database';
import styles from './TaskEditor.module.scss';

type ITaskEditorProps = {
  task: ITemplateTask;
  widgets: ITemplateWidget[];
  allWidgets: ITemplateWidget[];
  rules: ITemplateRule[];
  onTaskUpdate: (taskId: string, updates: Partial<ITemplateTask>) => Promise<void>;
  onWidgetAdd: (taskId: string, widgetType: string) => Promise<void>;
  onWidgetUpdate: (widgetId: string, updates: Partial<ITemplateWidget>) => Promise<void>;
  onWidgetDelete: (widgetId: string) => Promise<void>;
};

const ASSIGNEE_OPTIONS = [
  { value: 'ob', label: 'OB Rep' },
  { value: 'merchant', label: 'Merchant' },
];

const WIDGET_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multi_select', label: 'Multi Select' },
  { value: 'multi_choice', label: 'Multi Choice' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'file', label: 'File Upload' },
  { value: 'text_content', label: 'Content Block' },
];

const WIDGET_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  WIDGET_TYPE_OPTIONS.map(o => [o.value, o.label]),
);

export function TaskEditor({
  task,
  widgets,
  allWidgets,
  rules,
  onTaskUpdate,
  onWidgetAdd,
  onWidgetUpdate,
  onWidgetDelete,
}: ITaskEditorProps) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [addingWidget, setAddingWidget] = useState(false);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  const taskRules = rules.filter(r =>
    r.target_task_ids?.includes(task.id) ||
    r.target_widget_ids?.some(wid => widgets.some(w => w.id === wid || w.ps_group_id === wid)),
  );

  const handleTitleSave = useCallback(async () => {
    await onTaskUpdate(task.id, { title: titleValue });
    setEditingTitle(false);
  }, [task.id, titleValue, onTaskUpdate]);

  return (
    <div className={styles.container}>
      {/* Task header */}
      <div className={styles.header}>
        {editingTitle ? (
          <div className={styles.titleEdit}>
            <Input
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') { setEditingTitle(false); setTitleValue(task.title); }
              }}
            />
            <Button size="sm" onClick={handleTitleSave}>Save</Button>
          </div>
        ) : (
          <h2
            className={styles.title}
            onClick={() => { setEditingTitle(true); setTitleValue(task.title); }}
            title="Click to edit"
          >
            {task.title}
          </h2>
        )}
        <div className={styles.headerMeta}>
          <Badge
            color={task.assignee_type === 'merchant' ? 'orange' : 'blue'}
            size="small"
          >
            {task.assignee_type === 'merchant' ? 'Merchant' : 'OB Rep'}
          </Badge>
          {task.hidden_by_default && (
            <Badge color="gray" size="small">Hidden by default</Badge>
          )}
          {task.is_stop_gate && (
            <Badge color="red" size="small">Stop Gate</Badge>
          )}
        </div>
      </div>

      {/* Task settings */}
      <div className={styles.settings}>
        <div className={styles.settingsRow}>
          <Select
            label="Assignee"
            value={ASSIGNEE_OPTIONS.find(o => o.value === task.assignee_type) ?? ASSIGNEE_OPTIONS[0]}
            options={ASSIGNEE_OPTIONS}
            onChange={opt => onTaskUpdate(task.id, { assignee_type: (opt?.value ?? 'ob') as 'ob' | 'merchant' })}
            size="sm"
          />
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={task.hidden_by_default}
              onChange={e => onTaskUpdate(task.id, { hidden_by_default: e.target.checked })}
            />
            Hidden by default
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={task.is_stop_gate}
              onChange={e => onTaskUpdate(task.id, { is_stop_gate: e.target.checked })}
            />
            Stop gate
          </label>
        </div>
      </div>

      {/* Conditional rules summary */}
      {taskRules.length > 0 && (
        <div className={styles.rulesSection}>
          <h4 className={styles.sectionLabel}>Conditional Rules ({taskRules.length})</h4>
          {taskRules.map(rule => (
            <div key={rule.id} className={styles.ruleChip}>
              <span className={styles.ruleAction}>
                {rule.action === 'show' ? 'SHOW' : 'HIDE'}
              </span>
              <span className={styles.ruleCondition}>
                when {formatRuleCondition(rule, allWidgets)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Permissions */}
      <div className={styles.permissionsSection}>
        <h4 className={styles.sectionLabel}>Visibility Permissions</h4>
        <div className={styles.permissionsGrid}>
          {(['ob', 'merchant', 'admin', 'ae'] as ITaskPermissionRole[]).map(role => {
            const visibleTo = task.permissions?.visible_to ?? ['ob', 'merchant', 'admin', 'ae'];
            const checked = visibleTo.includes(role);
            return (
              <label key={role} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? visibleTo.filter(r => r !== role)
                      : [...visibleTo, role];
                    onTaskUpdate(task.id, {
                      permissions: { ...task.permissions, visible_to: next },
                    });
                  }}
                />
                {role === 'ob' ? 'OB Rep' : role === 'ae' ? 'AE' : role.charAt(0).toUpperCase() + role.slice(1)}
              </label>
            );
          })}
        </div>
      </div>

      {/* Automations */}
      <div className={styles.automationsSection}>
        <h4 className={styles.sectionLabel}>Automations</h4>
        {(task.automations ?? []).map((auto, idx) => (
          <div key={idx} className={styles.automationCard}>
            <div className={styles.automationHeader}>
              <Badge color={auto.enabled ? 'green' : 'gray'} size="small">
                {auto.provider}
              </Badge>
              <span className={styles.automationAction}>{auto.action}</span>
              <button
                className={styles.deleteWidgetButton}
                onClick={() => {
                  const next = [...(task.automations ?? [])];
                  next.splice(idx, 1);
                  onTaskUpdate(task.id, { automations: next });
                }}
              >
                <RemoveCircleIcon size={12} />
              </button>
            </div>
          </div>
        ))}
        <AutomationAdder
          onAdd={(auto) => {
            const next = [...(task.automations ?? []), auto];
            onTaskUpdate(task.id, { automations: next });
          }}
        />
      </div>

      {/* Widgets / Fields */}
      <div className={styles.widgetsSection}>
        <div className={styles.widgetsHeader}>
          <h4 className={styles.sectionLabel}>Fields ({widgets.length})</h4>
          <Button
            size="sm"
            variant="subtle"
            icon={<PlusIcon size={12} />}
            onClick={() => setAddingWidget(true)}
          >
            Add field
          </Button>
        </div>

        {addingWidget && (
          <div className={styles.addWidgetRow}>
            <Select
              value={null}
              options={WIDGET_TYPE_OPTIONS}
              onChange={opt => {
                if (opt) {
                  onWidgetAdd(task.id, String(opt.value));
                  setAddingWidget(false);
                }
              }}
              placeholder="Select field type..."
              size="sm"
            />
            <Button size="sm" variant="subtle" onClick={() => setAddingWidget(false)}>
              Cancel
            </Button>
          </div>
        )}

        {widgets.map(widget => (
          <WidgetRow
            key={widget.id}
            widget={widget}
            isEditing={editingWidgetId === widget.id}
            onEdit={() => setEditingWidgetId(editingWidgetId === widget.id ? null : widget.id)}
            onUpdate={onWidgetUpdate}
            onDelete={onWidgetDelete}
          />
        ))}

        {widgets.length === 0 && !addingWidget && (
          <div className={styles.emptyWidgets}>No fields yet</div>
        )}
      </div>
    </div>
  );
}

function WidgetRow({
  widget,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
}: {
  widget: ITemplateWidget;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (id: string, updates: Partial<ITemplateWidget>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [label, setLabel] = useState(widget.label ?? '');
  const [key, setKey] = useState(widget.key ?? '');
  const [optionsText, setOptionsText] = useState(
    Array.isArray(widget.options)
      ? (widget.options as Array<{ value: string }>).map(o => o.value).join('\n')
      : '',
  );

  const handleSave = useCallback(async () => {
    const options = optionsText
      .split('\n')
      .map(v => v.trim())
      .filter(Boolean)
      .map(value => ({ value }));

    await onUpdate(widget.id, {
      label: label || null,
      key: key || null,
      options,
      is_required: widget.is_required,
    });
    onEdit();
  }, [widget.id, label, key, optionsText, widget.is_required, onUpdate, onEdit]);

  return (
    <div className={styles.widgetRow} onClick={!isEditing ? onEdit : undefined}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetLabel}>
          {widget.label || widget.key || '(unlabeled)'}
          {widget.is_required && <span className={styles.required}> *</span>}
        </span>
        <div className={styles.widgetMeta}>
          <Badge color="gray" size="small">
            {WIDGET_TYPE_LABELS[widget.widget_type] || widget.widget_type}
          </Badge>
          {widget.hidden_by_default && (
            <Badge color="gray" size="small">Hidden</Badge>
          )}
          <button
            className={styles.deleteWidgetButton}
            onClick={e => { e.stopPropagation(); onDelete(widget.id); }}
            title="Delete field"
          >
            <RemoveCircleIcon size={12} />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className={styles.widgetEdit} onClick={e => e.stopPropagation()}>
          <Input
            label="Label"
            value={label}
            onChange={e => setLabel(e.target.value)}
            size="sm"
          />
          <Input
            label="Key"
            value={key}
            onChange={e => setKey(e.target.value)}
            size="sm"
          />
          {['select', 'multi_select', 'multi_choice'].includes(widget.widget_type) && (
            <div className={styles.optionsEdit}>
              <label className={styles.optionsLabel}>Options (one per line)</label>
              <textarea
                className={styles.optionsTextarea}
                value={optionsText}
                onChange={e => setOptionsText(e.target.value)}
                rows={5}
              />
            </div>
          )}
          <div className={styles.widgetEditActions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={widget.is_required}
                onChange={e => onUpdate(widget.id, { is_required: e.target.checked })}
              />
              Required
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={widget.hidden_by_default}
                onChange={e => onUpdate(widget.id, { hidden_by_default: e.target.checked })}
              />
              Hidden by default
            </label>
            <Button size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const AUTOMATION_PROVIDERS: { value: IAutomationProvider; label: string }[] = [
  { value: 'docusign', label: 'DocuSign' },
  { value: 'jira', label: 'Jira' },
  { value: 'salesforce', label: 'Salesforce' },
  { value: 'slack', label: 'Slack' },
  { value: 'google_sheets', label: 'Google Sheets' },
];

const AUTOMATION_ACTIONS: Record<IAutomationProvider, string[]> = {
  docusign: ['Send envelope', 'Request signature'],
  jira: ['Create issue', 'Update issue', 'Transition issue'],
  salesforce: ['Update opportunity', 'Create task', 'Log activity'],
  slack: ['Send message', 'Create channel', 'Send notification'],
  google_sheets: ['Add row', 'Update row', 'Create sheet'],
};

function AutomationAdder({ onAdd }: { onAdd: (auto: ITaskAutomation) => void }) {
  const [adding, setAdding] = useState(false);
  const [provider, setProvider] = useState<IAutomationProvider | null>(null);
  const [action, setAction] = useState('');

  if (!adding) {
    return (
      <Button
        size="sm"
        variant="subtle"
        icon={<PlusIcon size={12} />}
        onClick={() => setAdding(true)}
      >
        Add automation
      </Button>
    );
  }

  const actionOptions = provider ? AUTOMATION_ACTIONS[provider].map(a => ({ value: a, label: a })) : [];

  return (
    <div className={styles.addWidgetRow}>
      <Select
        value={AUTOMATION_PROVIDERS.find(p => p.value === provider) ?? null}
        options={AUTOMATION_PROVIDERS}
        onChange={opt => { setProvider(opt ? String(opt.value) as IAutomationProvider : null); setAction(''); }}
        placeholder="Provider..."
        size="sm"
      />
      {provider && (
        <Select
          value={actionOptions.find(a => a.value === action) ?? null}
          options={actionOptions}
          onChange={opt => setAction(String(opt?.value ?? ''))}
          placeholder="Action..."
          size="sm"
        />
      )}
      <Button
        size="sm"
        disabled={!provider || !action}
        onClick={() => {
          if (provider && action) {
            onAdd({ provider, action, config: {}, enabled: false });
            setAdding(false);
            setProvider(null);
            setAction('');
          }
        }}
      >
        Add
      </Button>
      <Button size="sm" variant="subtle" onClick={() => { setAdding(false); setProvider(null); setAction(''); }}>
        Cancel
      </Button>
    </div>
  );
}

function formatRuleCondition(rule: ITemplateRule, allWidgets: ITemplateWidget[]): string {
  if (rule.compound_conditions) {
    const firstGroup = rule.compound_conditions.conditions?.[0];
    const firstCond = firstGroup?.conditions?.[0];
    if (firstCond) {
      const widget = allWidgets.find(w => w.key === firstCond.widget_key);
      const fieldName = widget?.label || firstCond.widget_key;
      return `${fieldName} ${firstCond.operator} ${firstCond.value || '(empty)'}`;
    }
  }
  if (rule.trigger_widget_key) {
    const widget = allWidgets.find(w => w.key === rule.trigger_widget_key);
    const fieldName = widget?.label || rule.trigger_widget_key;
    return `${fieldName} ${rule.condition_operator} ${rule.condition_value ?? '(empty)'}`;
  }
  return 'unknown condition';
}
