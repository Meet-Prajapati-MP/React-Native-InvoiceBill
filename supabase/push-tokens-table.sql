-- =============================================================================
-- Push tokens table for Expo push notifications
-- Run in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

-- push_tokens: stores Expo push tokens per user (one device can have one token)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  phone TEXT,
  last_used TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS: users can only manage their own tokens (backend uses service role, but RLS for direct access)
CREATE POLICY "Users can manage own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add expo_push_token to profiles (legacy/fallback)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
