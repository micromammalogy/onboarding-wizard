-- ============================================================
-- Migration: Comments, Notifications, Activity Log, and supporting tables
-- Date: 2026-03-19
-- ============================================================

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- task_assigned, task_completed, task_overdue, merchant_complete, comment_mention, run_created, automation_fired
  title TEXT NOT NULL,
  body TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- Activity Log (audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  action TEXT NOT NULL, -- field_changed, task_completed, task_uncompleted, task_assigned, comment_added, status_changed, file_uploaded
  entity_type TEXT NOT NULL, -- task, project, field_value, comment
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_log_project_id ON activity_log(project_id);
CREATE INDEX idx_activity_log_task_id ON activity_log(task_id);

-- Standalone Tasks (ad-hoc tasks not tied to templates/runs)
CREATE TABLE standalone_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_standalone_tasks_user_id ON standalone_tasks(user_id);
CREATE TRIGGER update_standalone_tasks_updated_at BEFORE UPDATE ON standalone_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Data Sets
CREATE TABLE data_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER update_data_sets_updated_at BEFORE UPDATE ON data_sets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE data_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_set_id UUID NOT NULL REFERENCES data_sets(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_data_set_items_data_set_id ON data_set_items(data_set_id);

-- Email Sends
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  widget_key TEXT,
  to_email TEXT NOT NULL,
  cc_emails TEXT[],
  bcc_emails TEXT[],
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_by UUID REFERENCES users(id),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent', -- sent, delivered, bounced, failed
  provider_response JSONB
);
CREATE INDEX idx_email_sends_project_id ON email_sends(project_id);

-- Automation Logs
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  trigger_type TEXT NOT NULL, -- task_completed, run_created, run_completed, field_changed, due_date_reached, scheduled
  action_type TEXT NOT NULL, -- create_run, send_email, send_webhook, update_field, assign_task, complete_task
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  details JSONB DEFAULT '{}',
  error_message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_automation_logs_template_id ON automation_logs(template_id);
CREATE INDEX idx_automation_logs_project_id ON automation_logs(project_id);

-- Webhook Configs
CREATE TABLE webhook_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT, -- HMAC signing secret
  events TEXT[] NOT NULL, -- task_complete, project_complete, recommendation_executed, task_overdue
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER update_webhook_configs_updated_at BEFORE UPDATE ON webhook_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Webhook Deliveries
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_config_id UUID NOT NULL REFERENCES webhook_configs(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_webhook_deliveries_config_id ON webhook_deliveries(webhook_config_id);

-- Template Folders
CREATE TABLE template_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES template_folders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_folders_parent_id ON template_folders(parent_id);

-- Add folder_id to templates
ALTER TABLE templates ADD COLUMN folder_id UUID REFERENCES template_folders(id) ON DELETE SET NULL;

-- Add snoozed_until to tasks
ALTER TABLE tasks ADD COLUMN snoozed_until TIMESTAMPTZ;

-- Template Revisions
CREATE TABLE template_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published
  snapshot JSONB NOT NULL, -- full snapshot of template + tasks + widgets + rules at publish time
  published_by UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_template_revisions_template_id ON template_revisions(template_id);
CREATE UNIQUE INDEX idx_template_revisions_unique ON template_revisions(template_id, revision_number);

-- User preferences (replaces localStorage)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_user_preferences_unique ON user_preferences(user_id, preference_key);
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at();
