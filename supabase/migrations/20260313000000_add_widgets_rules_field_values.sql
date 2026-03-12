-- Stage 2 Refinement: Widgets, Rules, and Field Values
-- Adds template_widgets, template_rules, task_field_values tables
-- Adds is_stop_gate and is_visible columns to existing tables

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE widget_type AS ENUM (
  'text',
  'textarea',
  'richtext',
  'email',
  'url',
  'select',
  'multi_select',
  'multi_choice',
  'date',
  'file',
  'hidden',
  'send_rich_email'
);

CREATE TYPE rule_type AS ENUM (
  'conditional',
  'due_date',
  'assignment'
);

CREATE TYPE rule_action AS ENUM ('show', 'hide');

CREATE TYPE rule_target_type AS ENUM ('task', 'widget');

CREATE TYPE condition_operator AS ENUM (
  'is',
  'is_not',
  'contains',
  'has_no_value'
);

CREATE TYPE due_date_source AS ENUM (
  'checklist_start',
  'form_field'
);

CREATE TYPE due_date_offset_unit AS ENUM (
  'days',
  'hours',
  'weeks'
);

-- ============================================================
-- TEMPLATE WIDGETS
-- ============================================================

CREATE TABLE template_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_task_id UUID NOT NULL REFERENCES template_tasks (id) ON DELETE CASCADE,
  key TEXT,
  label TEXT,
  widget_type widget_type NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  hidden_by_default BOOLEAN NOT NULL DEFAULT false,
  options JSONB DEFAULT '[]',
  placeholder TEXT,
  metadata JSONB DEFAULT '{}',
  ps_group_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_widgets_task ON template_widgets (template_task_id);
CREATE INDEX idx_template_widgets_key ON template_widgets (key) WHERE key IS NOT NULL;
CREATE INDEX idx_template_widgets_ps_group ON template_widgets (ps_group_id) WHERE ps_group_id IS NOT NULL;

-- ============================================================
-- TEMPLATE RULES
-- ============================================================

CREATE TABLE template_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
  rule_type rule_type NOT NULL,

  -- Conditional rule fields
  trigger_widget_key TEXT,
  trigger_task_id UUID REFERENCES template_tasks (id) ON DELETE SET NULL,
  condition_operator condition_operator,
  condition_value JSONB,
  action rule_action,
  target_type rule_target_type,
  target_task_ids UUID[] DEFAULT '{}',
  target_widget_ids UUID[] DEFAULT '{}',
  compound_conditions JSONB,

  -- Due date rule fields
  due_date_source due_date_source,
  due_date_source_widget_key TEXT,
  due_date_offset_value INTEGER DEFAULT 0,
  due_date_offset_unit due_date_offset_unit DEFAULT 'days',
  due_date_direction TEXT CHECK (due_date_direction IN ('before', 'after')),
  due_date_workdays_only BOOLEAN DEFAULT false,

  -- Assignment rule fields
  assignment_source_widget_key TEXT,

  -- Process Street original IDs for mapping
  ps_rule_id TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_rules_template ON template_rules (template_id);
CREATE INDEX idx_template_rules_type ON template_rules (rule_type);

-- ============================================================
-- TASK FIELD VALUES
-- ============================================================

CREATE TABLE task_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks (id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  widget_key TEXT NOT NULL,
  value_text TEXT,
  value_date DATE,
  value_json JSONB,
  value_select TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_field_values_task ON task_field_values (task_id);
CREATE INDEX idx_field_values_project ON task_field_values (project_id);
CREATE INDEX idx_field_values_widget_key_text ON task_field_values (widget_key, value_text);
CREATE INDEX idx_field_values_widget_key_select ON task_field_values (widget_key, value_select);
CREATE INDEX idx_field_values_widget_key_date ON task_field_values (widget_key, value_date);
CREATE UNIQUE INDEX idx_field_values_task_widget ON task_field_values (task_id, widget_key);

CREATE TRIGGER trg_field_values_updated_at
  BEFORE UPDATE ON task_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MODIFICATIONS TO EXISTING TABLES
-- ============================================================

ALTER TABLE template_tasks ADD COLUMN is_stop_gate BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE template_tasks ADD COLUMN ps_group_id TEXT;

ALTER TABLE tasks ADD COLUMN is_stop_gate BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tasks ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX idx_template_tasks_ps_group ON template_tasks (ps_group_id) WHERE ps_group_id IS NOT NULL;
