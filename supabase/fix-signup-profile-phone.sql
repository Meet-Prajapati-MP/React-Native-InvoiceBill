-- =============================================================================
-- Fix: Ensure profile gets phone on signup (for User B receiver matching)
-- Run in Supabase SQL Editor
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_phone TEXT;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  -- Phone: from auth.phone, or raw_user_meta_data (Supabase phone auth)
  v_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number'
  );
  -- Normalize to last 10 digits for consistent matching
  IF v_phone IS NOT NULL AND length(regexp_replace(v_phone, '\D', '', 'g')) >= 10 THEN
    v_phone := right(regexp_replace(v_phone, '\D', '', 'g'), 10);
  ELSE
    v_phone := NULL;
  END IF;
  INSERT INTO profiles (id, full_name, email, phone)
  VALUES (NEW.id, v_full_name, v_email, v_phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
