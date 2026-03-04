-- Add PAN and GSTIN data columns to verification_status for storing verification data
-- Run this in Supabase SQL Editor if your verification_status table was created before these columns existed
ALTER TABLE verification_status ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE verification_status ADD COLUMN IF NOT EXISTS pan_holder_name TEXT;
ALTER TABLE verification_status ADD COLUMN IF NOT EXISTS gstin_number TEXT;
ALTER TABLE verification_status ADD COLUMN IF NOT EXISTS gstin_verified_at TIMESTAMPTZ;
