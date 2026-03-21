# Secrets & Credentials Guide

## Summary

- **Never commit** `.env` files. They are in `.gitignore`.
- **Never put backend secrets** in frontend code or frontend env vars.
- Use **placeholders only** in `.env.example`; never real keys.

---

## Frontend (InvoiceBill)

### Safe to expose (public by design)

- `EXPO_PUBLIC_API_URL` – Backend API base URL. The app needs this to call your API.

### Never put in frontend

- Supabase `service_role` or `anon` key (if you ever add a Supabase client)
- SabPaisa credentials
- JWT signing keys
- Any API keys or passwords

### Configuration

- Copy `.env.example` to `.env`
- Set `EXPO_PUBLIC_API_URL` for local dev or leave blank to use the default prod URL in code.
- For EAS builds, set `EXPO_PUBLIC_API_URL` in `eas.json` or via EAS Secrets.

---

## Backend (invoicebill-backend)

### Secrets (server-only)

These must **never** be committed. Set them in `.env` or Railway/hosting Variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (**highly sensitive**) |
| `SABPAISA_CLIENT_CODE` | SabPaisa client code |
| `SABPAISA_TRANS_USERNAME` | SabPaisa transaction username |
| `SABPAISA_TRANS_PASSWORD` | SabPaisa transaction password |
| `SABPAISA_AUTH_KEY` | SabPaisa auth key |
| `SABPAISA_AUTH_IV` | SabPaisa auth IV |
| `EXPO_ACCESS_TOKEN` | Optional – for push notifications |

### Configuration

- Copy `invoicebill-backend/.env.example` to `.env`
- Replace all placeholders with real values
- Do **not** commit `.env`

---

## Checklist Before Deploy

- [ ] `.env` is in `.gitignore` (both projects)
- [ ] `.env.example` contains **placeholders only**, no real keys
- [ ] Backend secrets are set in hosting (Railway Variables, etc.)
- [ ] Frontend only uses `EXPO_PUBLIC_API_URL` – no Supabase/SabPaisa keys
