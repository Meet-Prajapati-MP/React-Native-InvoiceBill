# Fix: "Database error saving new user"

## Problem

When creating an account, users see: **"Database error saving new user"**. Signup fails even with valid input.

## Root Cause

Supabase fires a trigger (`handle_new_user`) when a new user is inserted into `auth.users`. The trigger creates a row in `public.profiles`. If the trigger fails (e.g. RLS blocking the insert, or duplicate key), the whole signup transaction rolls back and Supabase returns this error.

## Fix

### Step 1: Run the SQL migration in Supabase

1. Open [Supabase Dashboard](https://app.supabase.com) → your project
2. Go to **SQL Editor**
3. Copy and run the contents of `supabase/fix-signup-database-error.sql`

This migration:

- Updates `handle_new_user` to run with `SECURITY DEFINER` and `SET search_path = public` (bypasses RLS correctly)
- Uses `ON CONFLICT (id) DO UPDATE` so retries or duplicate inserts do not fail

### Step 2: Redeploy backend (optional)

The backend now returns a clearer message when this error occurs. Redeploy if you want that change.

## Verification

1. Create a new account in the app
2. Signup should succeed
3. If it still fails, check **Supabase → Logs → Postgres logs** for the actual database error

## References

- [Supabase: Database error saving new user](https://supabase.com/docs/guides/troubleshooting/database-error-saving-new-user-RU_EwB)
