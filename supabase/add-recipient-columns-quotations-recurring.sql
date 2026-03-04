-- Add recipient columns to quotations and recurring_invoices (for User B delivery)
-- Run in Supabase SQL Editor
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS recipient_email TEXT;
ALTER TABLE recurring_invoices ADD COLUMN IF NOT EXISTS recipient_phone TEXT;
ALTER TABLE recurring_invoices ADD COLUMN IF NOT EXISTS recipient_email TEXT;
CREATE INDEX IF NOT EXISTS idx_quotations_recipient_phone ON quotations(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_quotations_recipient_email ON quotations(recipient_email);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_recipient_phone ON recurring_invoices(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_recipient_email ON recurring_invoices(recipient_email);
