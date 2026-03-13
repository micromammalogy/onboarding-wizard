-- Add cover_image_url to templates
ALTER TABLE templates ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Add permissions JSONB to template_tasks (e.g., { "visible_to": ["ob", "merchant", "admin"] })
ALTER TABLE template_tasks ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{}';

-- Add trigger_config JSONB to templates (e.g., { "type": "manual", "source": null })
ALTER TABLE templates ADD COLUMN IF NOT EXISTS trigger_config jsonb DEFAULT '{"type": "manual"}';

-- Add automations JSONB to template_tasks (future: integration configs)
ALTER TABLE template_tasks ADD COLUMN IF NOT EXISTS automations jsonb DEFAULT '[]';
