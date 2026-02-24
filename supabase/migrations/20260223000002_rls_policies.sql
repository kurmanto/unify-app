-- ─── Enable RLS on all tables ────────────────────────────

ALTER TABLE practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ─── Practitioner Policies ───────────────────────────────
-- Practitioners can only see/edit their own row

CREATE POLICY "practitioners_select_own"
  ON practitioners FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "practitioners_update_own"
  ON practitioners FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "practitioners_insert_own"
  ON practitioners FOR INSERT
  WITH CHECK (id = auth.uid());

-- ─── Client Policies ─────────────────────────────────────
-- Practitioners can only access their own clients

CREATE POLICY "clients_select_own"
  ON clients FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "clients_insert_own"
  ON clients FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "clients_update_own"
  ON clients FOR UPDATE
  USING (practitioner_id = auth.uid());

CREATE POLICY "clients_delete_own"
  ON clients FOR DELETE
  USING (practitioner_id = auth.uid());

-- ─── Session Types Policies ──────────────────────────────

CREATE POLICY "session_types_select_own"
  ON session_types FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "session_types_insert_own"
  ON session_types FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "session_types_update_own"
  ON session_types FOR UPDATE
  USING (practitioner_id = auth.uid());

CREATE POLICY "session_types_delete_own"
  ON session_types FOR DELETE
  USING (practitioner_id = auth.uid());

-- Public read for session types (needed by booking widget)
CREATE POLICY "session_types_public_read"
  ON session_types FOR SELECT
  USING (true);

-- ─── Series Policies ─────────────────────────────────────

CREATE POLICY "series_select_own"
  ON series FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "series_insert_own"
  ON series FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "series_update_own"
  ON series FOR UPDATE
  USING (practitioner_id = auth.uid());

-- ─── Appointment Policies ────────────────────────────────

CREATE POLICY "appointments_select_own"
  ON appointments FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "appointments_insert_own"
  ON appointments FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "appointments_update_own"
  ON appointments FOR UPDATE
  USING (practitioner_id = auth.uid());

CREATE POLICY "appointments_delete_own"
  ON appointments FOR DELETE
  USING (practitioner_id = auth.uid());

-- ─── SOAP Notes Policies ────────────────────────────────

CREATE POLICY "soap_notes_select_own"
  ON soap_notes FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "soap_notes_insert_own"
  ON soap_notes FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "soap_notes_update_own"
  ON soap_notes FOR UPDATE
  USING (practitioner_id = auth.uid());

-- ─── Intake Forms Policies ──────────────────────────────

CREATE POLICY "intake_forms_select_own"
  ON intake_forms FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "intake_forms_insert_own"
  ON intake_forms FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "intake_forms_update_own"
  ON intake_forms FOR UPDATE
  USING (practitioner_id = auth.uid());

-- ─── Campaign Policies ──────────────────────────────────

CREATE POLICY "campaigns_select_own"
  ON campaigns FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "campaigns_insert_own"
  ON campaigns FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "campaigns_update_own"
  ON campaigns FOR UPDATE
  USING (practitioner_id = auth.uid());

CREATE POLICY "campaigns_delete_own"
  ON campaigns FOR DELETE
  USING (practitioner_id = auth.uid());

-- ─── Campaign Recipients Policies ───────────────────────

CREATE POLICY "campaign_recipients_select_own"
  ON campaign_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
        AND campaigns.practitioner_id = auth.uid()
    )
  );

CREATE POLICY "campaign_recipients_insert_own"
  ON campaign_recipients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_recipients.campaign_id
        AND campaigns.practitioner_id = auth.uid()
    )
  );

-- ─── Document Policies ──────────────────────────────────

CREATE POLICY "documents_select_own"
  ON documents FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "documents_insert_own"
  ON documents FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "documents_update_own"
  ON documents FOR UPDATE
  USING (practitioner_id = auth.uid());

CREATE POLICY "documents_delete_own"
  ON documents FOR DELETE
  USING (practitioner_id = auth.uid());

-- ─── Payment Policies ───────────────────────────────────

CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (practitioner_id = auth.uid());

CREATE POLICY "payments_insert_own"
  ON payments FOR INSERT
  WITH CHECK (practitioner_id = auth.uid());

CREATE POLICY "payments_update_own"
  ON payments FOR UPDATE
  USING (practitioner_id = auth.uid());
