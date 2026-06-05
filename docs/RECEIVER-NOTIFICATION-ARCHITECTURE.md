# Receiver Notification Architecture – MNC-Grade Prompt

## Problem Statement

**User A** (sender) creates and sends invoices/quotations/recurring items. User A correctly receives:
- Expo push notifications
- In-app notification center entries

**User B** (receiver) does **not** receive:
- Expo push notifications
- Notification center entries

Phone/email are confirmed to match between User A’s customer record and User B’s identity. The system must reliably deliver to User B without crashes.

---

## System Architecture (Current Flow)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SEND FLOW (User A → User B)                            │
└─────────────────────────────────────────────────────────────────────────────────┘

  User A                    Backend                         User B
  ──────                    ───────                         ──────
     │                         │                                │
     │  POST /invoices         │                                │
     │  (customer_id or        │                                │
     │   recipient_phone/      │                                │
     │   recipient_email)     │                                │
     │ ──────────────────────>│                                │
     │                         │                                │
     │                         │ 1. Resolve recipient_phone,     │
     │                         │    recipient_email from        │
     │                         │    customer or body            │
     │                         │                                │
     │                         │ 2. RECEIVER LOOKUP             │
     │                         │    find_receiver_ids_by_phone   │
     │                         │    OR profiles.phone/email     │
     │                         │    match → receiverIds         │
     │                         │                                │
     │                         │ 3. If receiverIds empty →      │
     │                         │    NO notifications for B      │
     │                         │                                │
     │                         │ 4. For each receiverId:         │
     │                         │    - notifications.create()    │
     │                         │    - messages.insert()         │
     │                         │                                │
     │                         │ 5. Push: getTokensForUser()    │
     │                         │    → push_tokens + profiles.   │
     │                         │      expo_push_token           │
     │                         │    → sendMany()                │
     │                         │                                │
     │  <──────────────────────│                                │
     │  (invoice created)      │                                │
     │                         │                                │
     │  [User A gets push +     │  [User B gets push +           │
     │   notification center]  │   notification center]         │
     │                         │   ONLY IF:                     │
     │                         │   - receiverId found           │
     │                         │   - push token exists          │
```

---

## Root Cause Analysis (Why User B Fails)

| # | Failure Point | Condition | Effect |
|---|---------------|-----------|--------|
| 1 | **User B not in `profiles`** | User B is only a customer, never signed up | `receiverIds` empty → no notifications, no push |
| 2 | **Phone/email format mismatch** | Customer phone ≠ profile phone after normalization | Lookup fails → `receiverIds` empty |
| 3 | **RPC `find_receiver_ids_by_phone` missing** | SQL not run in Supabase | Fallback used; if fallback also fails → empty |
| 4 | **User B has no push token** | Never opened app after login, or permission denied | Push not sent; in-app notifications still work if receiverId found |
| 5 | **Recipient from wrong source** | `recipient_phone`/`recipient_email` from customer don’t match User B | Lookup fails |
| 6 | **Silent failures** | `notifications.create()` or `push.sendMany()` in try/catch | Errors swallowed, no visibility |

---

## MNC-Grade Solution Architecture

### 1. Canonical Identity Resolution (Single Source of Truth)

**Rule:** All phone/email matching must use the same normalization.

```
Input (any format)     →  normalizePhone()  →  last 10 digits (e.g. "9876543210")
Input (any format)     →  normalizeEmail()  →  lowercase, trim
```

**Implementation checklist:**
- [x] Customer phone/email: always stored via `phoneForStorage()` / `emailForStorage()`
- [x] Profile phone/email: synced from auth on signup and on first API call
- [x] Recipient lookup: compare normalized values only (shared `findReceiverIds` util)
- [ ] Ensure `find_receiver_ids_by_phone` exists in Supabase (run `InvoiceBill/supabase/recipient-lookup-function.sql`)

---

### 2. Receiver Lookup Pipeline (Defense in Depth)

```
Step 1: RPC find_receiver_ids_by_phone(phone_10, exclude_id)
        → Returns profile IDs where last 10 digits match

Step 2: If empty, fallback: profiles WHERE
        - phone = recipientPhone (exact)
        - OR phone LIKE '%' || recipientPhone (suffix)

Step 3: If recipientEmail present: profiles WHERE
        - email ILIKE normalizedEmail

Step 4: Union all receiverIds (Set to dedupe)
```

**Validation:** If `receiverIds.size === 0`, log a structured warning with:
- `recipient_phone` (masked: `***1234`)
- `recipient_email` (present/absent)
- Suggestion: "User B must have signed up; phone/email must match customer"

---

### 3. Push Token Lifecycle (User B Must Register)

```
User B signs in → PushRegistration runs → getExpoPushTokenAsync()
  → If permission granted → registerPushTokenWithBackend(token)
  → POST /register-push-token { token }
  → Insert/update push_tokens (user_id, token, phone)
```

**Requirements:**
- User B must open the app at least once after login
- User B must grant notification permission
- Backend must persist token in `push_tokens` (and optionally `profiles.expo_push_token`)

**If no token:** In-app notifications still work; push does not. Do not crash.

---

### 4. Notification Delivery (Dual Channel)

| Channel | Target | Condition |
|---------|--------|-----------|
| **In-app (notifications table)** | `user_id = receiverId` | receiverId found |
| **Push (Expo)** | Tokens from `getTokensForUser(receiverId)` | receiverId found AND token exists |

**Rule:** Never throw on notification failure. Log and continue. Invoice/quotation creation must succeed even if notifications fail.

---

### 5. Observability (Logging & Debugging)

**Structured logs to add:**

```text
[Receiver] Lookup: recipient_phone=***1234, recipient_email=set|null
[Receiver] Found N receiver(s): [id1, id2]
[Receiver] No receivers found – User B may not have signed up or phone/email mismatch
[Push] Sending to M tokens (sender) + N tokens (receivers)
[Push] User {receiverId} has 0 tokens – no push sent
```

**Optional:** Metrics for `receiver_lookup_found_count`, `receiver_lookup_empty_count`, `push_sent_count`, `push_skipped_no_token`.

---

### 6. End-to-End Validation Checklist

Before considering the issue "fixed", verify:

1. **User B exists in `profiles`**  
   - Query: `SELECT id, phone, email FROM profiles WHERE id = '<user_b_id>'`

2. **Customer matches User B**  
   - Customer phone (last 10) = Profile phone (last 10)  
   - OR Customer email (normalized) = Profile email (normalized)

3. **RPC exists**  
   - Run: `SELECT * FROM find_receiver_ids_by_phone('9876543210', NULL);`

4. **User B has push token**  
   - Query: `SELECT * FROM push_tokens WHERE user_id = '<user_b_id>'`

5. **Notification created for User B**  
   - Query: `SELECT * FROM notifications WHERE user_id = '<user_b_id>' ORDER BY created_at DESC LIMIT 5`

6. **No crashes**  
   - All notification/push calls in try/catch; invoice/quotation creation never fails due to notifications

---

## Implementation Prompt (Copy-Paste for AI)

```
You are a senior engineer implementing receiver notifications for an invoice app.

CONTEXT:
- User A sends invoices/quotations/recurring to customers.
- User B (receiver) should get: (1) Expo push, (2) Notification center entries.
- User A receives both; User B receives neither. Phone/email match between customer and User B.

REQUIREMENTS:
1. Ensure find_receiver_ids_by_phone RPC exists (run recipient-lookup-function.sql in Supabase).
2. Use canonical normalization: phone → last 10 digits, email → lowercase trim. Apply consistently in customer storage, profile sync, and recipient lookup.
3. Receiver lookup: try RPC first, then profiles fallback for phone; add email lookup. Union results.
4. When receiverIds is empty: log structured warning (masked phone, email presence). Do not crash.
5. Push: getTokensForUser(receiverId). If empty, log "[Push] User X has 0 tokens". Do not crash.
6. All notification/push calls in try/catch. Invoice/quotation creation must succeed regardless.
7. Add debug logs: receiver count, token count per user, send success/failure.

CONSTRAINTS:
- No breaking changes to existing APIs.
- User B must be an app user (in profiles) to receive. Document this.
- Handle missing push token gracefully (in-app notifications still work).
```

---

## Quick Diagnostic Commands

```sql
-- 1. Check if User B exists and has phone/email
SELECT id, phone, email, full_name FROM profiles WHERE phone LIKE '%9876543210%' OR email ILIKE '%userb@example.com%';

-- 2. Check if RPC exists
SELECT * FROM find_receiver_ids_by_phone('9876543210', NULL);

-- 3. Check push tokens for a user
SELECT * FROM push_tokens WHERE user_id = '<user_b_uuid>';

-- 4. Check recent notifications for User B
SELECT * FROM notifications WHERE user_id = '<user_b_uuid>' ORDER BY created_at DESC LIMIT 10;
```

---

## Summary

| Component | Responsibility |
|-----------|----------------|
| **Customer** | Source of recipient_phone, recipient_email (must match User B’s profile) |
| **Profile** | User B’s identity; phone/email synced from auth |
| **Receiver lookup** | Match customer → profile via normalized phone/email |
| **Notifications** | In-app entries for receiverId |
| **Push** | Expo tokens from push_tokens; send when token exists |
| **Resilience** | No crashes; log failures; invoice creation always succeeds |

User B receives notifications only when: (1) User B has signed up (in `profiles`), (2) customer phone/email match User B’s profile after normalization, and (3) for push, User B has registered a push token.
