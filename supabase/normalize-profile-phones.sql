-- =============================================================================
-- Normalize existing profile.phone to last 10 digits (for receiver matching)
-- Run in Supabase SQL Editor - fixes profiles with +91, spaces, etc.
-- =============================================================================

UPDATE profiles
SET phone = right(regexp_replace(phone, '\D', '', 'g'), 10)
WHERE phone IS NOT NULL
  AND length(regexp_replace(phone, '\D', '', 'g')) >= 10
  AND phone != right(regexp_replace(phone, '\D', '', 'g'), 10);
