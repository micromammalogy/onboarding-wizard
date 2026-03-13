import type {
  IConditionOperator,
  ITemplateRule,
} from '@/types/database';

/** Map key format: "taskId:widgetKey" for field values, "taskId" for task visibility */
export type IFieldValueMap = Map<string, string | null>;

/** Map key format: "taskId" or "taskId:widgetKey" -> boolean (visible or not) */
export type IVisibilityMap = Map<string, boolean>;

/** Resolved condition for the rules engine */
export interface IResolvedCondition {
  widgetKey: string;
  operator: IConditionOperator;
  value: string | null;
}

/** Resolved conditional rule after loading from DB */
export interface IResolvedConditionalRule {
  id: string;
  action: 'show' | 'hide';
  conditions: IResolvedCondition[][];
  targetTaskIds: string[];
  targetWidgetIds: string[];
}

/** Resolved due date rule */
export interface IResolvedDueDateRule {
  id: string;
  targetTaskId: string;
  source: 'checklist_start' | 'form_field';
  sourceWidgetKey: string | null;
  offsetValue: number;
  offsetUnit: 'days' | 'hours' | 'weeks';
  direction: 'before' | 'after';
  workdaysOnly: boolean;
}

/** Widget hidden_by_default map: widgetId -> boolean */
export type IHiddenByDefaultMap = Map<string, boolean>;

/** Converts a raw template rule to a resolved conditional rule */
export function toResolvedConditionalRule(
  rule: ITemplateRule,
  widgetKeyToId: Map<string, string>,
): IResolvedConditionalRule | null {
  if (rule.rule_type !== 'conditional' || !rule.action) return null;

  let conditions: IResolvedCondition[][] = [];

  if (rule.compound_conditions) {
    conditions = rule.compound_conditions.conditions.map(group =>
      group.conditions.map(c => ({
        widgetKey: c.widget_key,
        operator: c.operator,
        value: c.value,
      })),
    );
  } else if (rule.trigger_widget_key && rule.condition_operator) {
    conditions = [[{
      widgetKey: rule.trigger_widget_key,
      operator: rule.condition_operator,
      value: typeof rule.condition_value === 'string'
        ? rule.condition_value
        : rule.condition_value != null
          ? String(rule.condition_value)
          : null,
    }]];
  }

  if (conditions.length === 0) return null;

  // Widget targets are stored in metadata.targetWidgetGroupIds (PS group IDs)
  // because the seed script couldn't map them to UUIDs at generation time.
  // These PS group IDs match widget.ps_group_id used by ConditionalWrapper.
  const metadataWidgetIds =
    (rule.metadata as Record<string, unknown>)?.targetWidgetGroupIds;
  const widgetIds: string[] = rule.target_widget_ids.length > 0
    ? rule.target_widget_ids
    : Array.isArray(metadataWidgetIds)
      ? (metadataWidgetIds as string[])
      : [];

  return {
    id: rule.id,
    action: rule.action,
    conditions,
    targetTaskIds: rule.target_task_ids,
    targetWidgetIds: widgetIds,
  };
}

/** Converts a raw template rule to a resolved due date rule */
export function toResolvedDueDateRule(
  rule: ITemplateRule,
  templateTaskToTaskId: Map<string, string>,
): IResolvedDueDateRule | null {
  if (rule.rule_type !== 'due_date' || !rule.due_date_source) return null;

  const targetTaskId = rule.target_task_ids[0];
  if (!targetTaskId) return null;

  return {
    id: rule.id,
    targetTaskId,
    source: rule.due_date_source,
    sourceWidgetKey: rule.due_date_source_widget_key,
    offsetValue: rule.due_date_offset_value ?? 0,
    offsetUnit: rule.due_date_offset_unit ?? 'days',
    direction: rule.due_date_direction ?? 'after',
    workdaysOnly: rule.due_date_workdays_only,
  };
}
