-- PageBuilder: extend public_sections with block types and styling
ALTER TABLE public_sections ADD COLUMN IF NOT EXISTS section_type TEXT NOT NULL DEFAULT 'text-image-left';
ALTER TABLE public_sections ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT NULL;
ALTER TABLE public_sections ADD COLUMN IF NOT EXISTS text_color TEXT NOT NULL DEFAULT 'dark';
ALTER TABLE public_sections ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE public_sections ADD COLUMN IF NOT EXISTS text_align TEXT NOT NULL DEFAULT 'left';

-- Projects: font theme + CTA text
ALTER TABLE projects ADD COLUMN IF NOT EXISTS font_theme TEXT NOT NULL DEFAULT 'clean';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT NULL;
