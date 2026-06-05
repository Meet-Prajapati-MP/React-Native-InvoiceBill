# API Connection Troubleshooting

When you see **"Cannot reach server"** on Create Account or Sign In, the app cannot connect to your backend.

## Quick Checklist

1. [ ] Backend is running (`npm run start:dev` in invoicebill-backend)
2. [ ] Correct API URL in `.env` for your setup (see below)
3. [ ] Restarted Expo after changing `.env` (`npx expo start --clear`)
4. [ ] Windows Firewall allows Node on port 3000 (if using physical device)

---

## API URL by Setup

### Android Emulator

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
```

**Important:** `192.168.x.x` or `localhost` **do not work** in the Android emulator. Always use `10.0.2.2` (the emulator’s special alias for your PC’s localhost).

### Physical Device (same WiFi as PC)

1. Get your PC’s IPv4 address:
   - Windows: `ipconfig` → look for **IPv4 Address** (e.g. `192.168.1.4`)
   - Mac: `ifconfig` or System Preferences → Network

2. In `.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.4:3000
   ```
   Replace with your actual IP.

3. Allow the connection through Windows Firewall:
   - Run: `netsh advfirewall firewall add rule name="Node Backend" dir=in action=allow protocol=TCP localport=3000`

### Deployed Backend (Railway)

If the backend is deployed on Railway, use your Railway URL in `.env`:

```env
EXPO_PUBLIC_API_URL=https://your-app-name.up.railway.app
```

No `:3000` – Railway handles the port.

### Different Network (mobile data, different WiFi)

Use **ngrok** to expose your local backend:

1. Install ngrok: https://ngrok.com
2. Run in backend folder: `ngrok http 3000`
3. Copy the HTTPS URL (e.g. `https://abc123.ngrok-free.app`) into `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```

---

## Steps to Fix

1. **Start the backend:**
   ```bash
   cd invoicebill-backend
   npm run start:dev
   ```
   You should see `Nest application successfully started` and the port (e.g. 3000).

2. **Verify the URL:**
   - In a browser or Postman, open `http://localhost:3000` (or your configured URL).
   - You should get a response (e.g. 404 is fine if there is no root route).

3. **Update `.env`** in the InvoiceBill project root with the correct `EXPO_PUBLIC_API_URL` for your setup.

4. **Restart Expo with cache clear:**
   ```bash
   cd InvoiceBill
   npx expo start --clear
   ```

5. **Check the error message** – the app shows the URL it’s using so you can confirm it matches your setup.

---

## EAS / Production Builds

For `eas build --profile preview` or production builds, the app uses `EXPO_PUBLIC_API_URL` at build time.

1. Set the env in EAS:
   ```bash
   eas secret:create --name EXPO_PUBLIC_API_URL --value "https://your-railway-url.up.railway.app" --scope project
   ```

2. Or in `eas.json` under your build profile:
   ```json
   "env": {
     "EXPO_PUBLIC_API_URL": "https://your-railway-url.up.railway.app"
   }
   ```
