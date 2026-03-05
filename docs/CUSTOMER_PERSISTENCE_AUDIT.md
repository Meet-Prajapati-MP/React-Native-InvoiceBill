# Customer Persistence Audit

Customers created in the app were visible immediately but disappeared after several hours. This document records the investigation, root causes, and fixes applied.

---

## 1. Ranked List of Most Likely Causes

| Rank | Cause | Status |
|------|-------|--------|
| 1 | **No refetch on app resume** – App backgrounded for hours; no refresh when returning to foreground | ✅ Fixed (AppState listener) |
| 2 | **No refreshKey** – No way to force refetch when customers created elsewhere (SendInvoice, QuotationCreate) | ✅ Fixed (refreshKey prop) |
| 3 | **Stale in-memory state** – Long-lived component state not reflecting DB changes | ✅ Mitigated (refreshKey + AppState) |
| 4 | **Tab unmount/remount** – Customers tab unmounts when switching tabs; remount fetches but no explicit refresh on return | ✅ Mitigated (refreshKey + AppState) |
| 5 | **Database deletion** – Rows actually deleted by triggers/cron/cascade | ❌ Not found (no cron, no cleanup) |
| 6 | **Query filters** – GET /customers filtering by time/status | ❌ Not present (audit confirmed) |
| 7 | **user_id mismatch** – Insert vs query using different IDs | ❌ Not present (both use `req.user.id`) |
| 8 | **RLS hiding rows** – Backend uses service role; RLS bypassed | N/A |

---

## 2. SQL Queries to Verify Database State

Run these in Supabase SQL Editor or `psql`:

```sql
-- Verify customers exist and check created_at
SELECT id, name, user_id, created_at
FROM customers
ORDER BY created_at DESC
LIMIT 50;

-- Count per user
SELECT user_id, COUNT(*) AS cnt
FROM customers
GROUP BY user_id;

-- Check for triggers on customers (should only be updated_at)
SELECT tgname, tgtype
FROM pg_trigger
WHERE tgrelid = 'customers'::regclass;

-- Check for scheduled jobs (Supabase: pg_cron if enabled)
-- SELECT * FROM cron.job;  -- may not exist
```

---

## 3. Backend Code Fixes (GET /customers)

**File:** `invoicebill-backend/src/customers/customers.controller.ts`

- **No query changes** – The existing query is correct:
  - `.eq('user_id', req.user.id)` – filters by authenticated user
  - `.order('created_at', { ascending: false })` – no time filter
  - No soft-delete or status filters

- **Logging added** – To detect disappearing records:
  ```ts
  this.logger.log(`GET /customers user=${req.user.id} count=${list.length}`);
  ```

---

## 4. Frontend Fixes to Avoid Stale Caches

**File:** `src/pages/CustomersPage.tsx`

1. **refreshKey prop** – Included in `useEffect` dependency array so parent can force refetch.
2. **AppState listener** – Refetch when app returns from background (`active`):
   ```ts
   useEffect(() => {
     const sub = AppState.addEventListener('change', (nextState) => {
       if (nextState === 'active') fetchCustomers();
     });
     return () => sub.remove();
   }, [fetchCustomers]);
   ```

**File:** `App.tsx`

1. **customersRefreshKey state** – Incremented when:
   - SendInvoice succeeds (customer may have been created in flow)
   - CreateQuotationFlow succeeds (same)
2. **Pass refreshKey to CustomersPage** – Ensures fresh data when navigating to customers tab after those flows.

---

## 5. Logging Strategy to Detect Disappearing Records

| Layer | Log | Purpose |
|-------|-----|---------|
| Backend | `GET /customers user=X count=N` | Verify API returns expected count |
| Frontend | (Optional) Log `data.length` in fetchCustomers | Compare with UI list |
| Database | (Optional) `created_at` audit | Confirm rows exist hours later |

**Safe logging** – No PII in logs; use user ID only. Logs must not crash the app.

---

## 6. Test Cases to Ensure Customers Never Disappear

1. **Create and verify**
   - Create customer on Customers tab → appears immediately.
   - Switch to another tab, return → customer still visible.

2. **App background**
   - Create customer → switch to another app for 5+ minutes → return → customer still visible.

3. **Create from SendInvoice**
   - Open SendInvoice → add new customer in flow → complete invoice → close.
   - Navigate to Customers tab → new customer visible.

4. **Create from QuotationCreate**
   - Open Create Quotation → add new customer in flow → save quotation → close.
   - Navigate to Customers tab → new customer visible.

5. **Database persistence**
   - Create customer → wait 24 hours → run `SELECT * FROM customers` → row exists.
   - GET /customers returns same count as DB for that user.

---

## Schema Reference

- `customers` table: `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- No `deleted_at`, `is_deleted`, or `status` columns
- Index: `idx_customers_user_id`
- Triggers: `customers_updated_at` (updates `updated_at` only)
- No cron jobs or cleanup scripts found
