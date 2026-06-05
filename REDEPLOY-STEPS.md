# Redeploy "Receiver problem solving" State

Your code is at:
- **Frontend:** `883eb6b` Receiever problem solving 5:00
- **Backend:** `105be88` Receiever problem solving 5:00

---

## Step 1: Push to GitHub (so Railway can deploy)

```powershell
# Backend – push to trigger Railway redeploy
cd "M:\REACT NATIVE\invoicebill-backend"
git push origin master --force

# Frontend – push to GitHub
cd "M:\REACT NATIVE\InvoiceBill"
git push origin master --force
```

**Note:** Use `--force` only if you intend to overwrite the remote. If you get errors, your backend/frontend may use different branch names (e.g. `main` instead of `master`).

---

## Step 2: Redeploy Backend (Railway)

Your backend is at: `https://invoice-back-production-5762.up.railway.app`

**If Railway is connected to GitHub:**
- Pushing in Step 1 should trigger an automatic redeploy.
- Check: [Railway Dashboard](https://railway.app) → your project → Deployments.

**If you deploy manually:**
```powershell
cd "M:\REACT NATIVE\invoicebill-backend"
npm install
npm run build
# Then use Railway CLI: railway up
# Or redeploy from the Railway dashboard
```

---

## Step 3: Rebuild Frontend (Expo / EAS)

For a production APK:

```powershell
cd "M:\REACT NATIVE\InvoiceBill"
npm install
npx eas build --platform android --profile production
```

For iOS (if needed):

```powershell
npx eas build --platform ios --profile production
```

**First-time EAS setup:**
```powershell
npm install -g eas-cli
eas login
eas build:configure
```

---

## Step 4: Verify

1. **Backend:** Open `https://invoice-back-production-5762.up.railway.app/health` (or your health endpoint).
2. **Frontend:** Install the new APK from EAS or run `npx expo start` for development.

---

## Quick checklist

- [ ] Push backend to GitHub
- [ ] Push frontend to GitHub
- [ ] Confirm Railway redeploy
- [ ] Run `npm install` in both projects
- [ ] Build APK with `eas build --platform android`
- [ ] Test the app
