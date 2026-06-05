# Receiver Delivery Audit — Root Cause Analysis & Fixes

## 1. Ranked Failure Points (Most Likely First)

| Rank | Failure Point | Likelihood | Impact |
|------|---------------|------------|--------|
| 1 | **Profile phone/email missing** | HIGH | User B's profile has null phone/email → receiverIds empty, received list empty |
| 2 | **handle_new_user doesn't set phone** | HIGH | Signup trigger only sets full_name, email. Phone auth users get profile.phone=null |
| 3 | **Profile phone format mismatch** | MEDIUM | Invoice stores "9876543210", profile has "+919876543210" → fallback suffix works, but exact match fails |
| 4 | **find_receiver_ids_by_phone RPC missing** | MEDIUM | If RPC not run, fallback used. Fallback eq('phone', recipientPhone) fails for non-normalized profile.phone |
| 5 | **recipient_phone/recipient_email columns missing** | MEDIUM | Old DBs may lack columns → insert fails or data not stored |
| 6 | **push_tokens table / tokens missing** | MEDIUM | User B never registered push token → no push notifications |
| 7 | **notifications/messages table missing** | LOW | Backend uses service role; tables in schema. Run migrations if missing |
| 8 | **myPhone/myEmail empty on first request** | LOW | Profile sync runs before received query; should populate |

---

## 2. SQL Queries to Verify Each Stage

### Step 1 — Validate invoice creation

```sql
-- Check recent invoices have recipient data
SELECT id, number, recipient_phone, recipient_email, user_id, created_at
FROM invoices
ORDER BY created_at DESC
LIMIT 20;
```

### Step 2 — Verify phone normalization

```sql
-- Check profile phone formats (look for inconsistent storage)
SELECT id, phone, email, full_name,
  length(regexp_replace(coalesce(phone,''), '\D', '', 'g')) as digit_count,
  right(regexp_replace(coalesce(phone,''), '\D', '', 'g'), 10) as last_10
FROM profiles
WHERE phone IS NOT NULL
LIMIT 20;
```

### Step 3 — Debug receiver lookup

```sql
-- Test find_receiver_ids_by_phone (replace with actual 10-digit phone)
SELECT * FROM find_receiver_ids_by_phone('9876543210', NULL);

-- Manual fallback: find profiles matching phone
SELECT id, phone, email FROM profiles
WHERE right(regexp_replace(coalesce(phone,''), '\D', '', 'g'), 10) = '9876543210';
```

### Step 4 — Validate profile data for User B

```sql
-- Replace USER_B_ID with actual UUID
SELECT id, phone, email, full_name FROM profiles WHERE id = 'USER_B_ID';

-- Check auth.users for same user (phone/email source)
SELECT id, email, phone, raw_user_meta_data
FROM auth.users
WHERE id = 'USER_B_ID';
```

### Step 5 — Validate notification creation

```sql
-- Check notifications for User B
SELECT id, user_id, title, type, created_at
FROM notifications
WHERE user_id = 'USER_B_ID'
ORDER BY created_at DESC
LIMIT 10;
```

### Step 6 — Verify push tokens

```sql
SELECT user_id, token, last_used FROM push_tokens WHERE user_id = 'USER_B_ID';
```

### Step 7 — Verify received invoice listing

```sql
-- Simulate GET /invoices for User B (replace my_phone, my_email)
SELECT id, number, recipient_phone, recipient_email, user_id
FROM invoices
WHERE user_id != 'USER_B_ID'
  AND (
    recipient_phone = '9876543210'
    OR recipient_phone LIKE '%9876543210'
    OR lower(recipient_email) = 'userb@example.com'
  );
```

### Step 8 — Check column existence

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'invoices' AND column_name IN ('recipient_phone', 'recipient_email');
```

---

## 3. Code Fixes

### Fix 1: handle_new_user trigger (supabase/fix-signup-profile-phone.sql)

Already created. Ensures profile.phone is set from auth on signup and normalized to 10 digits.

### Fix 2: Receiver lookup — improve fallback and add logging

See invoices.controller.ts changes below.

### Fix 3: Central normalization

recipient.util.ts already provides normalizePhone, phoneForStorage, normalizeEmail. Ensure all paths use it.

---

## 4. Logging Strategy (Safe, Non-Crashing)

- Use `Logger` from NestJS; log at `debug` or `warn` level.
- Never throw from logging.
- Log: recipientPhone, recipientEmail, receiverIds.length, insert outcomes.
- Redact PII in production (log last 4 digits only for phone).

---

## 5. Architectural Improvements

1. **Profile sync on login** — Ensure AuthContext or backend syncs profile.phone/email from auth when session is established.
2. **Normalize profile.phone on write** — When user updates profile, normalize phone before store.
3. **Indexes** — recipient_phone, recipient_email (already in migrations).
4. **Reconciliation job** — Optional: periodic job that finds invoices with recipient_phone/email matching profiles with null and backfills notifications.
5. **Health check** — Endpoint that verifies find_receiver_ids_by_phone exists and returns expected shape.

---

## 6. Test Cases

| Scenario | Setup | Expected |
|----------|-------|----------|
| Phone mismatch | Invoice recipient_phone=9876543210, User B profile.phone=+919876543210 | User B in receiverIds (RPC/suffix match), receives |
| Email mismatch | Invoice recipient_email=UserB@x.com, profile.email=userb@x.com | Match (ilike), User B receives |
| Missing profile | User B profile.phone=null, profile.email=null | receiverIds empty, no delivery. Sync on first GET /invoices should fix. |
| Missing push token | User B has no push_tokens row | Notifications/messages still created; push not sent |
| RPC missing | find_receiver_ids_by_phone not created | Fallback used; eq may fail if profile.phone not exact 10 digits |

---

## 7. Migration Checklist (Run in Order)

1. **recipient-lookup-function.sql** — Creates `find_receiver_ids_by_phone` RPC
2. **fix-signup-profile-phone.sql** — Updates `handle_new_user` to set phone on signup
3. **normalize-profile-phones.sql** — Normalizes existing profile.phone to 10 digits
4. **invoice-recipient-columns.sql** — Adds recipient_phone, recipient_email to invoices
5. **add-recipient-columns-quotations-recurring.sql** — Same for quotations, recurring_invoices
6. **push-tokens-table.sql** — Creates push_tokens table
7. **notifications-table.sql** — Creates notifications table
