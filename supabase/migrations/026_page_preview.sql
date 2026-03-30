-- Stores full draft state (sections + theme) for preview before publishing
ALTER TABLE projects ADD COLUMN IF NOT EXISTS page_preview_data JSONB;
