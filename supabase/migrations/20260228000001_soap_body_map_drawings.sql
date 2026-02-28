-- Add body_map_drawings column to soap_notes for storing SVG drawing annotations
ALTER TABLE soap_notes ADD COLUMN IF NOT EXISTS body_map_drawings JSONB;
