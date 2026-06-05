# MobSF Security Preparation

This document describes security measures implemented for MobSF (Mobile Security Framework) testing.

## Implemented

### 1. **Secure token storage**
- `expo-secure-store` for access_token and refresh_token (Android Keystore / iOS Keychain)
- Fallback to AsyncStorage on web; migration from AsyncStorage on first run

### 2. **Backup disabled**
- `android:allowBackup="false"` – prevents app data (including tokens) from being backed up to unencrypted storage

### 3. **Error boundary**
- Root-level `ErrorBoundary` catches React errors and shows fallback UI instead of crashing

### 4. **Image load safety**
- `onError` handlers on all remote `Image` components (avatar, logo, attachments) to prevent crash on load failure

### 5. **WebView security**
- `originWhitelist` restricted to `https://*`, `http://localhost*`, `http://10.0.2.2*` (no `*`)

### 6. **No hardcoded secrets**
- API URL from `EXPO_PUBLIC_API_URL` env; fallback only for dev
- `.env` in `.gitignore`; use `.env.example` as template

## Build for MobSF

1. **Production APK** (recommended for MobSF):
   ```bash
   eas build --platform android --profile production
   ```

2. **Ensure** `EXPO_PUBLIC_API_URL` is set to your HTTPS backend in `eas.json` (already configured).

3. **After build**, download the APK and upload to MobSF.

## Common MobSF findings

| Finding | Status |
|--------|--------|
| Insecure data storage | Mitigated: SecureStore for tokens |
| Backup enabled | Fixed: allowBackup=false |
| WebView originWhitelist * | Fixed: restricted to https/localhost |
| Missing Error Boundary | Fixed |
| Debuggable | EAS production builds set debuggable=false |
| Minification | EAS production enables by default |
