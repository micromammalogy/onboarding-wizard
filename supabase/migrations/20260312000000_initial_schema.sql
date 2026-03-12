-- Stage 1: Database Foundation
-- Initial schema for Zonos Onboarding Platform
-- All tables use UUIDs, no Supabase-specific features in business logic

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('ob_rep', 'ae', 'admin');

CREATE TYPE project_status AS ENUM (
  'not_started',
  'in_progress',
  'on_hold',
  'completed',
  'canceled'
);

CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'merchant_complete',
  'ob_verified',
  'complete',
  'skipped'
);

CREATE TYPE task_assignee_type AS ENUM ('ob', 'merchant');

CREATE TYPE due_date_type AS ENUM ('fixed', 'relative');

CREATE TYPE ingest_source AS ENUM ('gong_call', 'gong_email');

CREATE TYPE recommendation_type AS ENUM (
  'fulfillment_location',
  'tax_id',
  'shipping_rule',
  'checkout_setting',
  'currency'
);

CREATE TYPE recommendation_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'executed'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'ob_rep',
  zonos_credential_token TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- ============================================================
-- TEMPLATES
-- ============================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- TEMPLATE TASKS
-- ============================================================

CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  section TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  assignee_type task_assignee_type NOT NULL DEFAULT 'ob',
  due_date_type due_date_type NOT NULL DEFAULT 'relative',
  due_date_offset_days INTEGER DEFAULT 0,
  task_type TEXT DEFAULT 'standard',
  metadata JSONB DEFAULT '{}',
  hidden_by_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_tasks_template ON template_tasks (template_id);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id TEXT NOT NULL,
  merchant_name TEXT NOT NULL,
  store_url TEXT,
  platform TEXT,
  ae_id UUID REFERENCES users (id) ON DELETE SET NULL,
  ob_rep_id UUID REFERENCES users (id) ON DELETE SET NULL,
  template_id UUID REFERENCES templates (id) ON DELETE SET NULL,
  start_date DATE,
  projected_completion_date DATE,
  actual_completion_date DATE,
  status project_status NOT NULL DEFAULT 'not_started',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_merchant ON projects (merchant_id);
CREATE INDEX idx_projects_ob_rep ON projects (ob_rep_id);
CREATE INDEX idx_projects_ae ON projects (ae_id);
CREATE INDEX idx_projects_status ON projects (status);

-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES template_tasks (id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  section TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  assignee_type task_assignee_type NOT NULL DEFAULT 'ob',
  assignee_id UUID REFERENCES users (id) ON DELETE SET NULL,
  due_date_type due_date_type NOT NULL DEFAULT 'relative',
  due_date_offset_days INTEGER DEFAULT 0,
  due_date_fixed DATE,
  status task_status NOT NULL DEFAULT 'pending',
  task_type TEXT DEFAULT 'standard',
  metadata JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_project ON tasks (project_id);
CREATE INDEX idx_tasks_assignee ON tasks (assignee_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_due_date ON tasks (due_date_fixed);

-- ============================================================
-- INGEST RECORDS (Stage 4 — table created now for FK readiness)
-- ============================================================

CREATE TABLE ingest_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id TEXT NOT NULL,
  source ingest_source NOT NULL,
  external_id TEXT,
  content_text TEXT,
  metadata JSONB DEFAULT '{}',
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_ingest_external ON ingest_records (source, external_id);
CREATE INDEX idx_ingest_merchant ON ingest_records (merchant_id);

-- ============================================================
-- AI RECOMMENDATIONS (Stage 5 — table created now for FK readiness)
-- ============================================================

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id TEXT NOT NULL,
  ingest_record_ids UUID[] DEFAULT '{}',
  recommendation_type recommendation_type NOT NULL,
  suggested_value JSONB NOT NULL DEFAULT '{}',
  reasoning TEXT,
  confidence_score NUMERIC(3, 2),
  status recommendation_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users (id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recommendations_merchant ON ai_recommendations (merchant_id);
CREATE INDEX idx_recommendations_status ON ai_recommendations (status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_recommendations_updated_at
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
