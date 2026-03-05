-- =============================================================================
-- Password reset OTP table (6-digit OTP sent to email)
-- Run in Supabase SQL Editor
-- =============================================================================
-- Required: SMTP must be configured in backend (.env: SMTP_HOST, SMTP_USER, SMTP_PASS)
-- for OTP emails to be sent. Without SMTP, OTP is logged to console in dev.

CREATE TABLE IF NOT EXISTS password_reset_otps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_otps_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_expires ON password_reset_otps(expires_at);
