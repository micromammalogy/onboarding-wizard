// ============================================================
// Database Types — Stage 1: Database Foundation
// Hand-written to match supabase/migrations/20260312000000_initial_schema.sql
// ============================================================

// --- Enums ---

export type IUserRole = 'ob_rep' | 'ae' | 'admin';

export type IProjectStatus =
  | 'not_started'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'canceled';

export type ITaskStatus =
  | 'pending'
  | 'in_progress'
  | 'merchant_complete'
  | 'ob_verified'
  | 'complete'
  | 'skipped';

export type ITaskAssigneeType = 'ob' | 'merchant';

export type IDueDateType = 'fixed' | 'relative';

export type IIngestSource = 'gong_call' | 'gong_email';

export type IRecommendationType =
  | 'fulfillment_location'
  | 'tax_id'
  | 'shipping_rule'
  | 'checkout_setting'
  | 'currency';

export type IRecommendationStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'executed';

// --- Tables ---

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: IUserRole;
  zonos_credential_token: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ITemplate {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ITemplateTask {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  section: string | null;
  order_index: number;
  assignee_type: ITaskAssigneeType;
  due_date_type: IDueDateType;
  due_date_offset_days: number | null;
  task_type: string;
  metadata: Record<string, unknown>;
  hidden_by_default: boolean;
  is_stop_gate: boolean;
  ps_group_id: string | null;
  created_at: string;
}

export interface IProject {
  id: string;
  merchant_id: string;
  merchant_name: string;
  store_url: string | null;
  platform: string | null;
  ae_id: string | null;
  ob_rep_id: string | null;
  template_id: string | null;
  start_date: string | null;
  projected_completion_date: string | null;
  actual_completion_date: string | null;
  status: IProjectStatus;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ITask {
  id: string;
  project_id: string;
  template_task_id: string | null;
  title: string;
  description: string | null;
  section: string | null;
  order_index: number;
  assignee_type: ITaskAssigneeType;
  assignee_id: string | null;
  due_date_type: IDueDateType;
  due_date_offset_days: number | null;
  due_date_fixed: string | null;
  status: ITaskStatus;
  task_type: string;
  metadata: Record<string, unknown>;
  is_stop_gate: boolean;
  is_visible: boolean;
  completed_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IIngestRecord {
  id: string;
  merchant_id: string;
  source: IIngestSource;
  external_id: string | null;
  content_text: string | null;
  metadata: Record<string, unknown>;
  ingested_at: string;
}

export interface IAiRecommendation {
  id: string;
  merchant_id: string;
  ingest_record_ids: string[];
  recommendation_type: IRecommendationType;
  suggested_value: Record<string, unknown>;
  reasoning: string | null;
  confidence_score: number | null;
  status: IRecommendationStatus;
  reviewed_by: string | null;
  executed_at: string | null;
  execution_result: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// --- Input types (for create/update operations) ---

export type IUserCreate = Omit<IUser, 'id' | 'created_at' | 'updated_at'>;
export type IUserUpdate = Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>;

export type IProjectCreate = Omit<IProject, 'id' | 'created_at' | 'updated_at'>;
export type IProjectUpdate = Partial<Omit<IProject, 'id' | 'created_at' | 'updated_at'>>;

export type ITaskCreate = Omit<ITask, 'id' | 'created_at' | 'updated_at'>;
export type ITaskUpdate = Partial<Omit<ITask, 'id' | 'created_at' | 'updated_at'>>;

export type ITemplateCreate = Omit<ITemplate, 'id' | 'created_at' | 'updated_at'>;

export type ITemplateTaskCreate = Omit<ITemplateTask, 'id' | 'created_at'>;

// --- Stage 2 Refinement: Widgets, Rules, Field Values ---

export type IWidgetType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'email'
  | 'url'
  | 'select'
  | 'multi_select'
  | 'multi_choice'
  | 'date'
  | 'file'
  | 'hidden'
  | 'send_rich_email';

export type IRuleType = 'conditional' | 'due_date' | 'assignment';

export type IRuleAction = 'show' | 'hide';

export type IRuleTargetType = 'task' | 'widget';

export type IConditionOperator = 'is' | 'is_not' | 'contains' | 'has_no_value';

export type IDueDateSource = 'checklist_start' | 'form_field';

export type IDueDateOffsetUnit = 'days' | 'hours' | 'weeks';

export interface ITemplateWidget {
  id: string;
  template_task_id: string;
  key: string | null;
  label: string | null;
  widget_type: IWidgetType;
  order_index: number;
  is_required: boolean;
  hidden_by_default: boolean;
  options: unknown[];
  placeholder: string | null;
  metadata: Record<string, unknown>;
  ps_group_id: string | null;
  created_at: string;
}

export interface ICondition {
  widget_key: string;
  operator: IConditionOperator;
  value: string | null;
}

export interface ICompoundConditions {
  logic: 'and' | 'or';
  conditions: Array<{
    logic: 'and' | 'or';
    conditions: ICondition[];
  }>;
}

export interface ITemplateRule {
  id: string;
  template_id: string;
  rule_type: IRuleType;
  trigger_widget_key: string | null;
  trigger_task_id: string | null;
  condition_operator: IConditionOperator | null;
  condition_value: unknown;
  action: IRuleAction | null;
  target_type: IRuleTargetType | null;
  target_task_ids: string[];
  target_widget_ids: string[];
  compound_conditions: ICompoundConditions | null;
  due_date_source: IDueDateSource | null;
  due_date_source_widget_key: string | null;
  due_date_offset_value: number | null;
  due_date_offset_unit: IDueDateOffsetUnit | null;
  due_date_direction: 'before' | 'after' | null;
  due_date_workdays_only: boolean;
  assignment_source_widget_key: string | null;
  ps_rule_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ITaskFieldValue {
  id: string;
  task_id: string;
  project_id: string;
  widget_key: string;
  value_text: string | null;
  value_date: string | null;
  value_json: unknown;
  value_select: string | null;
  created_at: string;
  updated_at: string;
}

export type ITemplateWidgetCreate = Omit<ITemplateWidget, 'id' | 'created_at'>;
export type ITemplateRuleCreate = Omit<ITemplateRule, 'id' | 'created_at'>;
export type ITaskFieldValueCreate = Omit<ITaskFieldValue, 'id' | 'created_at' | 'updated_at'>;
export type ITaskFieldValueUpdate = Partial<Pick<ITaskFieldValue, 'value_text' | 'value_date' | 'value_json' | 'value_select'>>;
