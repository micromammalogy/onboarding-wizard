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
