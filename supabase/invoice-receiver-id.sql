-- =============================================================================
-- Add receiver_id to invoices for reliable receiver visibility.
-- When User A creates an invoice for User B (registered), we store receiver_id.
-- User B fetches received invoices by receiver_id = current user (most reliable path).
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_receiver_id ON invoices(receiver_id);

COMMENT ON COLUMN invoices.receiver_id IS 'Primary receiver user ID when recipient is a registered user. Enables reliable received-invoice visibility.';

-- Optional: If User B's profile has null phone/email, run fix-signup-profile-phone.sql
-- to ensure handle_new_user populates phone from auth.
