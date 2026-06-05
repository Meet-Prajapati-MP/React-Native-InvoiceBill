-- Run in Supabase SQL Editor if reminder_settings / reminder_log don't exist
-- =============================================================================
-- REMINDER_SETTINGS (user default preferences for Send Reminder)
-- =============================================================================
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL DEFAULT 'friendly',
  subject TEXT,
  message TEXT,
  send_via_email BOOLEAN DEFAULT TRUE,
  send_via_sms BOOLEAN DEFAULT FALSE,
  attach_pdf BOOLEAN DEFAULT TRUE,
  cc_me BOOLEAN DEFAULT FALSE,
  log_activity BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_settings_user_id ON reminder_settings(user_id);

ALTER TABLE reminder_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own reminder_settings" ON reminder_settings;
CREATE POLICY "Users can CRUD own reminder_settings"
  ON reminder_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- REMINDER_LOG (audit when reminders were sent)
-- =============================================================================
CREATE TABLE IF NOT EXISTS reminder_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  recipient_email TEXT,
  recipient_phone TEXT,
  subject TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_log_user_id ON reminder_log(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_log_invoice_id ON reminder_log(invoice_id);

ALTER TABLE reminder_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminder_log" ON reminder_log;
CREATE POLICY "Users can view own reminder_log"
  ON reminder_log FOR SELECT
  USING (auth.uid() = user_id);

-- Backend uses service role key (bypasses RLS) for inserts

-- Trigger for updated_at
CREATE TRIGGER reminder_settings_updated_at
  BEFORE UPDATE ON reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
