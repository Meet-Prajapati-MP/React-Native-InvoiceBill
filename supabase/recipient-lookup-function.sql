-- =============================================================================
-- Recipient lookup: find User B by phone (last 10 digits) for push/in-app delivery
-- Run in Supabase SQL Editor
-- =============================================================================

CREATE OR REPLACE FUNCTION find_receiver_ids_by_phone(phone_10 TEXT, exclude_id UUID DEFAULT NULL)
RETURNS TABLE (id UUID) AS $$
DECLARE
  digits_10 TEXT;
BEGIN
  digits_10 := right(regexp_replace(coalesce(phone_10, ''), '\D', '', 'g'), 10);
  IF length(digits_10) < 10 THEN
    RETURN;
  END IF;
  RETURN QUERY
  SELECT p.id
  FROM profiles p
  WHERE p.phone IS NOT NULL
    AND length(regexp_replace(p.phone, '\D', '', 'g')) >= 10
    AND right(regexp_replace(p.phone, '\D', '', 'g'), 10) = digits_10
    AND (exclude_id IS NULL OR p.id != exclude_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
