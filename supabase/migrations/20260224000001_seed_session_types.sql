-- Seed default session types for Rolfing practitioners
-- Creates a SECURITY DEFINER function, trigger for new signups, and backfill

-- Function to seed default session types for a practitioner (only if they have none)
CREATE OR REPLACE FUNCTION seed_default_session_types(p_practitioner_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only seed if practitioner has no session types yet
  IF EXISTS (SELECT 1 FROM session_types WHERE practitioner_id = p_practitioner_id) THEN
    RETURN;
  END IF;

  INSERT INTO session_types (practitioner_id, name, duration_minutes, price_cents, currency, tax_rate, description, is_package, package_sessions, package_price_cents)
  VALUES
    (p_practitioner_id, 'Rolfing Ten Series Session', 90, 18000, 'CAD', 0.13, 'Progressive 10-session structural integration protocol', FALSE, NULL, NULL),
    (p_practitioner_id, 'Single Rolfing Session', 90, 18000, 'CAD', 0.13, 'Standalone session for existing clients', FALSE, NULL, NULL),
    (p_practitioner_id, 'Rolfing Tune-Up', 60, 14000, 'CAD', 0.13, 'Shorter follow-up after completing a series', FALSE, NULL, NULL),
    (p_practitioner_id, 'Initial Consultation', 30, 0, 'CAD', 0.13, 'First visit — assessment, posture photos, health history', FALSE, NULL, NULL),
    (p_practitioner_id, 'Advanced Rolfing Session', 90, 18000, 'CAD', 0.13, 'Post-Ten-Series deeper structural work', FALSE, NULL, NULL),
    (p_practitioner_id, 'Craniosacral Therapy', 60, 14000, 'CAD', 0.13, 'Gentle craniosacral technique session', FALSE, NULL, NULL),
    (p_practitioner_id, 'Ten Series Package', 90, 18000, 'CAD', 0.13, 'Full Ten Series package — 10 sessions at 10% off ($1,620 total)', TRUE, 10, 162000);
END;
$$;

-- Trigger function to auto-seed on new practitioner signup
CREATE OR REPLACE FUNCTION trigger_seed_session_types()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM seed_default_session_types(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on practitioners table
DROP TRIGGER IF EXISTS trg_seed_session_types ON practitioners;
CREATE TRIGGER trg_seed_session_types
  AFTER INSERT ON practitioners
  FOR EACH ROW
  EXECUTE FUNCTION trigger_seed_session_types();

-- Backfill: seed session types for all existing practitioners who have none
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM practitioners LOOP
    PERFORM seed_default_session_types(r.id);
  END LOOP;
END;
$$;
