-- Add recipient columns for invoice delivery by phone/email.
-- Run in Supabase SQL Editor if columns don't exist.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recipient_email TEXT;
CREATE INDEX IF NOT EXISTS idx_invoices_recipient_phone ON invoices(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_invoices_recipient_email ON invoices(recipient_email);
