-- Time blocks for marking unavailable periods on the schedule
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_blocks_practitioner ON time_blocks(practitioner_id);
CREATE INDEX idx_time_blocks_date ON time_blocks(practitioner_id, starts_at);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_blocks_select_own" ON time_blocks FOR SELECT USING (practitioner_id = auth.uid());
CREATE POLICY "time_blocks_insert_own" ON time_blocks FOR INSERT WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY "time_blocks_update_own" ON time_blocks FOR UPDATE USING (practitioner_id = auth.uid());
CREATE POLICY "time_blocks_delete_own" ON time_blocks FOR DELETE USING (practitioner_id = auth.uid());
