-- Run this in Supabase SQL Editor if invoice_settings table doesn't exist
CREATE TABLE IF NOT EXISTS invoice_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target TEXT NOT NULL CHECK (target IN ('invoices', 'quotes')),
  format_type TEXT DEFAULT 'preset' CHECK (format_type IN ('preset', 'custom')),
  selected_template TEXT,
  starting_number TEXT DEFAULT '001',
  reset_option TEXT DEFAULT 'never' CHECK (reset_option IN ('never', 'fy', 'year', 'month')),
  padding INTEGER DEFAULT 3,
  duplicate_check TEXT DEFAULT 'error' CHECK (duplicate_check IN ('error', 'auto')),
  manual_override BOOLEAN DEFAULT FALSE,
  skip_deleted BOOLEAN DEFAULT TRUE,
  custom_components JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, target)
);

CREATE INDEX IF NOT EXISTS idx_invoice_settings_user_id ON invoice_settings(user_id);

ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own invoice settings" ON invoice_settings;
CREATE POLICY "Users can CRUD own invoice settings"
  ON invoice_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
