-- Add content widget types for rich text blocks, images, videos, embeds
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'text_content';
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'image';
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'video';
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'embed';
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'cross_link';
ALTER TYPE widget_type ADD VALUE IF NOT EXISTS 'subtask';
