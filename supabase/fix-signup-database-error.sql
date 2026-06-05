-- =============================================================================
-- Fix: "Database error saving new user" on signup
-- Root cause: handle_new_user trigger can fail due to RLS or duplicate key.
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================
-- See: https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB

-- 1. Ensure function runs with elevated privileges (bypasses RLS)
-- 2. Use ON CONFLICT to handle retries / duplicate inserts
-- 3. Set search_path for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone TEXT;
  v_email TEXT;
  v_full_name TEXT;
BEGIN
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  v_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email');
  v_phone := COALESCE(
    NEW.phone,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone_number'
  );
  IF v_phone IS NOT NULL AND length(regexp_replace(v_phone, '\D', '', 'g')) >= 10 THEN
    v_phone := right(regexp_replace(v_phone, '\D', '', 'g'), 10);
  ELSE
    v_phone := NULL;
  END IF;

  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, v_full_name, v_email, v_phone)
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
