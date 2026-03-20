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

export type ITriggerType = 'manual' | 'salesforce' | 'api' | 'scheduled';

export interface ITriggerConfig {
  type: ITriggerType;
  source?: string | null;
  schedule?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ITemplate {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  is_active: boolean;
  cover_image_url: string | null;
  trigger_config: ITriggerConfig;
  created_at: string;
  updated_at: string;
}

export type ITaskPermissionRole = 'ob' | 'merchant' | 'admin' | 'ae';

export interface ITaskPermissions {
  visible_to?: ITaskPermissionRole[];
  editable_by?: ITaskPermissionRole[];
}

export type IAutomationProvider = 'docusign' | 'jira' | 'salesforce' | 'slack' | 'google_sheets';

export interface ITaskAutomation {
  provider: IAutomationProvider;
  action: string;
  config: Record<string, unknown>;
  enabled: boolean;
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
  permissions: ITaskPermissions;
  automations: ITaskAutomation[];
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
  | 'send_rich_email'
  | 'text_content'
  | 'image'
  | 'video'
  | 'embed'
  | 'cross_link'
  | 'subtask';

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

// --- Stage 2+: Comments, Notifications, Activity, and supporting tables ---

// --- Enums (new) ---

export type INotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'merchant_complete'
  | 'comment_mention'
  | 'run_created'
  | 'automation_fired';

export type IActivityAction =
  | 'field_changed'
  | 'task_completed'
  | 'task_uncompleted'
  | 'task_assigned'
  | 'comment_added'
  | 'status_changed'
  | 'file_uploaded';

export type IActivityEntityType = 'task' | 'project' | 'field_value' | 'comment';

export type IDeliveryStatus = 'sent' | 'delivered' | 'bounced' | 'failed';

export type IAutomationTriggerType =
  | 'task_completed'
  | 'run_created'
  | 'run_completed'
  | 'field_changed'
  | 'due_date_reached'
  | 'scheduled';

export type IAutomationActionType =
  | 'create_run'
  | 'send_email'
  | 'send_webhook'
  | 'update_field'
  | 'assign_task'
  | 'complete_task';

export type IAutomationStatus = 'pending' | 'success' | 'failed';

export type IWebhookEvent =
  | 'task_complete'
  | 'project_complete'
  | 'recommendation_executed'
  | 'task_overdue';

export type IWebhookDeliveryStatus = 'pending' | 'success' | 'failed';

export type ITemplateRevisionStatus = 'draft' | 'published';

// --- Comments ---

export interface IComment {
  id: string;
  task_id: string;
  project_id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export type ICommentCreate = Omit<IComment, 'id' | 'created_at' | 'updated_at'>;

// --- Notifications ---

export interface INotification {
  id: string;
  user_id: string | null;
  type: INotificationType;
  title: string;
  body: string | null;
  project_id: string | null;
  task_id: string | null;
  is_read: boolean;
  created_at: string;
}

export type INotificationCreate = Omit<INotification, 'id' | 'created_at'>;

// --- Activity Log ---

export interface IActivityLog {
  id: string;
  project_id: string | null;
  task_id: string | null;
  user_id: string | null;
  user_name: string | null;
  action: IActivityAction;
  entity_type: IActivityEntityType;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export type IActivityLogCreate = Omit<IActivityLog, 'id' | 'created_at'>;

// --- Standalone Tasks ---

export interface IStandaloneTask {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  snoozed_until: string | null;
  created_at: string;
  updated_at: string;
}

export type IStandaloneTaskCreate = Omit<IStandaloneTask, 'id' | 'created_at' | 'updated_at'>;
export type IStandaloneTaskUpdate = Partial<Omit<IStandaloneTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// --- Data Sets ---

export interface IDataSet {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type IDataSetCreate = Omit<IDataSet, 'id' | 'created_at' | 'updated_at'>;

export interface IDataSetItem {
  id: string;
  data_set_id: string;
  value: string;
  order_index: number;
  created_at: string;
}

export type IDataSetItemCreate = Omit<IDataSetItem, 'id' | 'created_at'>;

// --- Email Sends ---

export interface IEmailSend {
  id: string;
  task_id: string | null;
  project_id: string | null;
  widget_key: string | null;
  to_email: string;
  cc_emails: string[] | null;
  bcc_emails: string[] | null;
  subject: string;
  body: string;
  sent_by: string | null;
  sent_at: string;
  delivery_status: IDeliveryStatus;
  provider_response: Record<string, unknown> | null;
}

export type IEmailSendCreate = Omit<IEmailSend, 'id' | 'sent_at'>;

// --- Automation Logs ---

export interface IAutomationLog {
  id: string;
  template_id: string | null;
  project_id: string | null;
  task_id: string | null;
  trigger_type: IAutomationTriggerType;
  action_type: IAutomationActionType;
  status: IAutomationStatus;
  details: Record<string, unknown>;
  error_message: string | null;
  executed_at: string;
}

export type IAutomationLogCreate = Omit<IAutomationLog, 'id' | 'executed_at'>;

// --- Webhook Configs ---

export interface IWebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  events: IWebhookEvent[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type IWebhookConfigCreate = Omit<IWebhookConfig, 'id' | 'created_at' | 'updated_at'>;
export type IWebhookConfigUpdate = Partial<Omit<IWebhookConfig, 'id' | 'created_at' | 'updated_at'>>;

// --- Webhook Deliveries ---

export interface IWebhookDelivery {
  id: string;
  webhook_config_id: string;
  event: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  attempt_count: number;
  status: IWebhookDeliveryStatus;
  next_retry_at: string | null;
  created_at: string;
}

// --- Template Folders ---

export interface ITemplateFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_by: string | null;
  created_at: string;
}

export type ITemplateFolderCreate = Omit<ITemplateFolder, 'id' | 'created_at'>;

// --- Template Revisions ---

export interface ITemplateRevision {
  id: string;
  template_id: string;
  revision_number: number;
  status: ITemplateRevisionStatus;
  snapshot: Record<string, unknown>;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
}

export type ITemplateRevisionCreate = Omit<ITemplateRevision, 'id' | 'created_at'>;

// --- User Preferences ---

export interface IUserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type IUserPreferenceCreate = Omit<IUserPreference, 'id' | 'created_at' | 'updated_at'>;
