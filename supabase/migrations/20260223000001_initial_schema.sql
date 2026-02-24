-- ─── Custom Types ────────────────────────────────────────

CREATE TYPE appointment_status AS ENUM (
  'requested', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'paid', 'partially_paid', 'refunded', 'failed'
);

CREATE TYPE payment_processor AS ENUM ('stripe', 'square');

CREATE TYPE series_type AS ENUM ('ten_series', 'custom');

CREATE TYPE series_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

CREATE TYPE form_type AS ENUM (
  'intake', 'health_history', 'consent', 'cancellation_policy', 'custom'
);

CREATE TYPE campaign_status AS ENUM (
  'draft', 'scheduled', 'sending', 'sent', 'cancelled'
);

CREATE TYPE document_type AS ENUM (
  'intake_form', 'consent_form', 'waiver', 'receipt', 'other'
);

CREATE TYPE processor_payment_status AS ENUM (
  'succeeded', 'pending', 'failed', 'refunded', 'cancelled'
);

-- ─── Tables ──────────────────────────────────────────────

-- Practitioners (linked to auth.users)
CREATE TABLE practitioners (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  business_name TEXT NOT NULL DEFAULT 'Unify Rolfing',
  timezone TEXT NOT NULL DEFAULT 'America/Toronto',
  schedule_config JSONB NOT NULL DEFAULT '{
    "days": [
      {"day": 0, "enabled": false, "start_time": "09:00", "end_time": "18:00", "breaks": []},
      {"day": 1, "enabled": true, "start_time": "09:00", "end_time": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
      {"day": 2, "enabled": true, "start_time": "09:00", "end_time": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
      {"day": 3, "enabled": true, "start_time": "09:00", "end_time": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
      {"day": 4, "enabled": true, "start_time": "09:00", "end_time": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
      {"day": 5, "enabled": true, "start_time": "09:00", "end_time": "18:00", "breaks": [{"start": "12:00", "end": "13:00"}]},
      {"day": 6, "enabled": false, "start_time": "09:00", "end_time": "18:00", "breaks": []}
    ],
    "buffer_minutes": 15,
    "booking_window_days": 30
  }'::jsonb,
  stripe_customer_id TEXT,
  square_merchant_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address JSONB,
  emergency_contact JSONB,
  health_history JSONB,
  intake_completed BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_practitioner ON clients(practitioner_id);
CREATE INDEX idx_clients_email ON clients(practitioner_id, email);

-- Session Types
CREATE TABLE session_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.13,
  description TEXT,
  is_package BOOLEAN NOT NULL DEFAULT FALSE,
  package_sessions INTEGER,
  package_price_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_types_practitioner ON session_types(practitioner_id);

-- Series (Ten Series or custom)
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  type series_type NOT NULL DEFAULT 'ten_series',
  total_sessions INTEGER NOT NULL DEFAULT 10,
  current_session INTEGER NOT NULL DEFAULT 0,
  status series_status NOT NULL DEFAULT 'active',
  package_payment_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_series_client ON series(client_id);
CREATE INDEX idx_series_practitioner ON series(practitioner_id);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  session_type_id UUID NOT NULL REFERENCES session_types(id),
  series_id UUID REFERENCES series(id),
  session_number INTEGER,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'requested',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_processor payment_processor,
  payment_id TEXT,
  external_calendar_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_practitioner ON appointments(practitioner_id);
CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(practitioner_id, starts_at);
CREATE INDEX idx_appointments_status ON appointments(practitioner_id, status);

-- SOAP Notes
CREATE TABLE soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  ai_transcript TEXT,
  focus_areas JSONB,
  techniques_used JSONB,
  session_goals JSONB,
  pre_session_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_soap_notes_appointment ON soap_notes(appointment_id);

-- Intake Forms
CREATE TABLE intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  form_type form_type NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  signature_url TEXT,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intake_forms_client ON intake_forms(client_id);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL DEFAULT '',
  segment_tags TEXT[] NOT NULL DEFAULT '{}',
  status campaign_status NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_campaigns_practitioner ON campaigns(practitioner_id);

-- Campaign Recipients
CREATE TABLE campaign_recipients (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  PRIMARY KEY (campaign_id, client_id)
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  name TEXT NOT NULL,
  signed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_client ON documents(client_id);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CAD',
  tax_cents INTEGER NOT NULL DEFAULT 0,
  processor payment_processor NOT NULL,
  processor_payment_id TEXT,
  status processor_payment_status NOT NULL DEFAULT 'pending',
  card_last_four TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_practitioner ON payments(practitioner_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
