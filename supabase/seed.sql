-- Seed data for Zonos Onboarding Platform
-- Run after initial migration to populate test data

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (id, email, name, role) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'shawn.roah@zonos.com', 'Shawn Roah', 'admin'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'jane.doe@zonos.com', 'Jane Doe', 'ob_rep'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'mike.chen@zonos.com', 'Mike Chen', 'ae');

-- ============================================================
-- TEMPLATE: Universal Onboarding
-- ============================================================

INSERT INTO templates (id, name, description, created_by, is_active) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', 'Zonos Onboarding - Universal Template', 'Standard onboarding checklist for Zonos merchants using Landed Cost', 'a1b2c3d4-0001-4000-8000-000000000001', true);

INSERT INTO template_tasks (id, template_id, title, description, section, order_index, assignee_type, due_date_type, due_date_offset_days, task_type) VALUES
  -- Opportunity Information
  ('c1000001-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Project details (intake form)', 'Complete the intake form with merchant info, platform, integration type, and contacts', 'Opportunity Information', 0, 'ob', 'relative', 0, 'standard'),
  ('c1000001-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Opportunity information', 'Review opportunity details and confirm merchant readiness', 'Opportunity Information', 1, 'ob', 'relative', 0, 'standard'),
  ('c1000001-0003-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Project status and launch date', 'Set project status and confirm target launch date', 'Opportunity Information', 2, 'ob', 'relative', 0, 'standard'),

  -- Account Setup & Billing
  ('c1000002-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Add team members', 'Add merchant contacts to the Zonos dashboard', 'Account Setup', 3, 'ob', 'relative', 2, 'standard'),
  ('c1000002-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Zonos account checklist (internal)', 'Verify all account settings are configured correctly', 'Account Setup', 4, 'ob', 'relative', 2, 'standard'),
  ('c1000002-0003-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Send billing email (internal)', 'Send billing setup email to merchant', 'Account Setup', 5, 'ob', 'relative', 2, 'email_draft'),

  -- Welcome & Communication
  ('c1000003-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Schedule kickoff call', 'Schedule and send calendar invite for kickoff call', 'Welcome & Communication', 6, 'ob', 'relative', 2, 'standard'),
  ('c1000003-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Send follow up email', 'Send follow up email after kickoff call', 'Welcome & Communication', 7, 'ob', 'relative', 3, 'email_draft'),

  -- Platform Configuration
  ('c1000004-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Install Zonos app on merchant platform', 'Guide merchant through platform-specific Zonos app installation', 'Platform Configuration', 8, 'merchant', 'relative', 5, 'standard'),
  ('c1000004-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Configure platform settings', 'Configure platform-specific settings for Zonos integration', 'Platform Configuration', 9, 'ob', 'relative', 5, 'standard'),

  -- Checkout Configuration
  ('c1000005-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Checkout settings', 'Configure checkout button style, notification emails, success behavior', 'Checkout Configuration', 10, 'ob', 'relative', 5, 'standard'),
  ('c1000005-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Branding settings', 'Set up merchant branding (logo, colors) in checkout', 'Checkout Configuration', 11, 'ob', 'relative', 5, 'standard'),

  -- Shipping Configuration
  ('c1000006-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Connect carrier accounts', 'Connect UPS, FedEx, DHL, or other carrier accounts', 'Shipping Configuration', 12, 'merchant', 'relative', 7, 'standard'),
  ('c1000006-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Add warehouse location', 'Add fulfillment center location to Zonos', 'Shipping Configuration', 13, 'ob', 'relative', 7, 'standard'),

  -- Testing & QA
  ('c1000007-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'QA checklist', 'Run through QA checklist to verify all settings', 'Testing & QA', 14, 'ob', 'relative', 10, 'standard'),
  ('c1000007-0002-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'QA results / Go-live email', 'Send QA results and go-live confirmation to merchant', 'Testing & QA', 15, 'ob', 'relative', 12, 'email_draft'),

  -- Go Live
  ('c1000008-0001-4000-8000-000000000001', 'b1b2c3d4-0001-4000-8000-000000000001', 'Go live', 'Switch merchant from test mode to production', 'Go Live', 16, 'ob', 'relative', 14, 'standard');

-- ============================================================
-- PROJECT 1: Active onboarding (in progress)
-- ============================================================

INSERT INTO projects (id, merchant_id, merchant_name, store_url, platform, ae_id, ob_rep_id, template_id, start_date, projected_completion_date, status) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', '5782', 'Acme International', 'https://acme-intl.com', 'Shopify', 'a1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0001-4000-8000-000000000001', '2026-03-01', '2026-03-28', 'in_progress');

INSERT INTO tasks (project_id, title, description, section, order_index, assignee_type, assignee_id, due_date_type, due_date_offset_days, due_date_fixed, status, task_type, completed_at) VALUES
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Project details (intake form)', 'Complete the intake form', 'Opportunity Information', 0, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 0, '2026-03-01', 'complete', 'standard', '2026-03-01T10:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Opportunity information', 'Review opportunity details', 'Opportunity Information', 1, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 0, '2026-03-01', 'complete', 'standard', '2026-03-01T11:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Project status and launch date', 'Set launch date', 'Opportunity Information', 2, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 0, '2026-03-01', 'complete', 'standard', '2026-03-01T12:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Add team members', 'Add merchant contacts', 'Account Setup', 3, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 2, '2026-03-03', 'complete', 'standard', '2026-03-03T09:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Zonos account checklist (internal)', 'Verify account settings', 'Account Setup', 4, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 2, '2026-03-03', 'complete', 'standard', '2026-03-03T10:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Schedule kickoff call', 'Schedule kickoff', 'Welcome & Communication', 6, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 2, '2026-03-03', 'complete', 'standard', '2026-03-02T14:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Install Zonos app on Shopify', 'Install Zonos Duty and Tax app', 'Platform Configuration', 8, 'merchant', NULL, 'relative', 5, '2026-03-06', 'merchant_complete', 'standard', '2026-03-05T16:00:00Z'),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Configure Shopify settings', 'Configure Shopify-specific settings', 'Platform Configuration', 9, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 5, '2026-03-06', 'in_progress', 'standard', NULL),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Checkout settings', 'Configure checkout', 'Checkout Configuration', 10, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 5, '2026-03-06', 'pending', 'standard', NULL),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Connect carrier accounts', 'Connect UPS account', 'Shipping Configuration', 12, 'merchant', NULL, 'relative', 7, '2026-03-08', 'pending', 'standard', NULL),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Add warehouse location', 'Add fulfillment center', 'Shipping Configuration', 13, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 7, '2026-03-08', 'pending', 'standard', NULL),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'QA checklist', 'Run QA', 'Testing & QA', 14, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 10, '2026-03-11', 'pending', 'standard', NULL),
  ('d1b2c3d4-0001-4000-8000-000000000001', 'Go live', 'Switch to production', 'Go Live', 16, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 14, '2026-03-15', 'pending', 'standard', NULL);

-- ============================================================
-- PROJECT 2: New project (not started)
-- ============================================================

INSERT INTO projects (id, merchant_id, merchant_name, store_url, platform, ae_id, ob_rep_id, template_id, start_date, projected_completion_date, status) VALUES
  ('d1b2c3d4-0002-4000-8000-000000000001', '6100', 'GlobalGoods Co', 'https://globalgoods.co', 'BigCommerce', 'a1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0001-4000-8000-000000000001', '2026-03-15', '2026-04-15', 'not_started');

INSERT INTO tasks (project_id, title, description, section, order_index, assignee_type, assignee_id, due_date_type, due_date_offset_days, due_date_fixed, status, task_type) VALUES
  ('d1b2c3d4-0002-4000-8000-000000000001', 'Project details (intake form)', 'Complete the intake form', 'Opportunity Information', 0, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 0, '2026-03-15', 'pending', 'standard'),
  ('d1b2c3d4-0002-4000-8000-000000000001', 'Opportunity information', 'Review opportunity details', 'Opportunity Information', 1, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 0, '2026-03-15', 'pending', 'standard'),
  ('d1b2c3d4-0002-4000-8000-000000000001', 'Add team members', 'Add merchant contacts', 'Account Setup', 3, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 2, '2026-03-17', 'pending', 'standard'),
  ('d1b2c3d4-0002-4000-8000-000000000001', 'Install Zonos Checkout app - BigCommerce', 'Install the BigCommerce app', 'Platform Configuration', 8, 'merchant', NULL, 'relative', 5, '2026-03-20', 'pending', 'standard'),
  ('d1b2c3d4-0002-4000-8000-000000000001', 'QA checklist', 'Run QA', 'Testing & QA', 14, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 10, '2026-03-25', 'pending', 'standard'),
  ('d1b2c3d4-0002-4000-8000-000000000001', 'Go live', 'Switch to production', 'Go Live', 16, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'relative', 14, '2026-03-29', 'pending', 'standard');

-- ============================================================
-- PROJECT 3: Completed
-- ============================================================

INSERT INTO projects (id, merchant_id, merchant_name, store_url, platform, ae_id, ob_rep_id, template_id, start_date, projected_completion_date, actual_completion_date, status) VALUES
  ('d1b2c3d4-0003-4000-8000-000000000001', '4200', 'EuroStyle Fashion', 'https://eurostyle.eu', 'WooCommerce', 'a1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0002-4000-8000-000000000002', 'b1b2c3d4-0001-4000-8000-000000000001', '2026-02-01', '2026-02-28', '2026-02-25', 'completed');

INSERT INTO tasks (project_id, title, section, order_index, assignee_type, assignee_id, due_date_type, due_date_fixed, status, task_type, completed_at) VALUES
  ('d1b2c3d4-0003-4000-8000-000000000001', 'Project details (intake form)', 'Opportunity Information', 0, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'fixed', '2026-02-01', 'complete', 'standard', '2026-02-01T10:00:00Z'),
  ('d1b2c3d4-0003-4000-8000-000000000001', 'Install Zonos Checkout app - WooCommerce', 'Platform Configuration', 8, 'merchant', NULL, 'fixed', '2026-02-07', 'complete', 'standard', '2026-02-06T15:00:00Z'),
  ('d1b2c3d4-0003-4000-8000-000000000001', 'Checkout settings', 'Checkout Configuration', 10, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'fixed', '2026-02-10', 'complete', 'standard', '2026-02-09T11:00:00Z'),
  ('d1b2c3d4-0003-4000-8000-000000000001', 'QA checklist', 'Testing & QA', 14, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'fixed', '2026-02-20', 'complete', 'standard', '2026-02-19T14:00:00Z'),
  ('d1b2c3d4-0003-4000-8000-000000000001', 'Go live', 'Go Live', 16, 'ob', 'a1b2c3d4-0002-4000-8000-000000000002', 'fixed', '2026-02-25', 'complete', 'standard', '2026-02-25T10:00:00Z');
