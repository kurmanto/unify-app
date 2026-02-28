-- SOAP Notes Upgrade: status workflow, auto-save tracking, AI suggestions, recording metadata

-- Add new columns to soap_notes
ALTER TABLE soap_notes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS ai_suggestions JSONB,
  ADD COLUMN IF NOT EXISTS recording_mode TEXT,
  ADD COLUMN IF NOT EXISTS recording_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Constraint for status values
ALTER TABLE soap_notes
  ADD CONSTRAINT soap_notes_status_check CHECK (status IN ('draft', 'complete'));

-- Constraint for recording_mode values
ALTER TABLE soap_notes
  ADD CONSTRAINT soap_notes_recording_mode_check CHECK (recording_mode IN ('dictation', 'live_intake') OR recording_mode IS NULL);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_soap_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER soap_notes_updated_at
  BEFORE UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_soap_notes_updated_at();

-- Index for efficient practitioner + status queries
CREATE INDEX IF NOT EXISTS idx_soap_notes_practitioner_status
  ON soap_notes (practitioner_id, status);

-- Mark existing notes with content as 'complete'
UPDATE soap_notes
  SET status = 'complete'
  WHERE subjective IS NOT NULL OR objective IS NOT NULL OR assessment IS NOT NULL OR plan IS NOT NULL;
