# Navigation & Back-Handling Architecture

## Overview

This app uses **state-based navigation** (not React Navigation). Screens and modals are controlled by `useState` flags. The back-handling system overrides Android's hardware back button to provide predictable navigation and exit confirmation.

## Stack Structure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         AppContent                               │
├─────────────────────────────────────────────────────────────────┤
│  When !isAuthenticated (Auth Flow):                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Root: SignIn OR Onboarding  →  Back = Exit Confirm          ││
│  │ Nested: ResetPassword ← OtpVerification ← RequestOtp        ││
│  │         CreateAccount → back to SignIn                      ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│  When isAuthenticated (Main App):                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Root: Main tabs (Home, Invoices, etc.)  →  Back = Exit       ││
│  │ Overlays (top to bottom, back closes topmost):              ││
│  │   ExitConfirm → LogoutConfirm → PaymentWebView →            ││
│  │   VerificationCenter → MessageCentre → HelpCentre → ...     ││
│  │   ItemList → ReportsAnalytics → SendReminders → MyAddresses ││
│  │   TermsConditions → InvoiceSettings → BusinessProfile →     ││
│  │   Activity → BankAccounts → SubscriptionDetails → MyProfile ││
│  │   Notifications → CreateQuotation → SendInvoice →           ││
│  │   Withdraw → AddMoney → Transfer → ScanQR →                 ││
│  │   selectedInvoice → selectedQuote → selectedCustomer →      ││
│  │   selectedTransaction                                       ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Rules

1. **Device back / swipe-back**: Navigate to previous screen if stack exists; never exit immediately.
2. **Root screen**: Show exit confirmation dialog; exit only on user confirm.
3. **Logged-in users**: Never navigate back to Sign In, Create Account, OTP, or any auth screen.
4. **After login**: Auth screens are cleared from "stack" (state reset); Home becomes root.

## Components

### BackHandlerService (`src/navigation/BackHandlerService.ts`)

- `getTopmostBackAction(config)`: Returns the close function for the topmost overlay, or null if at root.
- `isAtRoot(config)`: True when no overlay is open.
- Overlay order defines z-index; topmost = highest priority for back.

### useAppBackHandler (`src/hooks/useAppBackHandler.ts`)

- Registers a single `BackHandler.addEventListener('hardwareBackPress', ...)`.
- Uses refs for callbacks so the effect runs once (no re-subscriptions, no leaks).
- When `isAtRoot`: calls `onExitRequest` (show exit dialog).
- When not at root: calls `onBack` (close overlay or go to previous auth screen).

### Login Stack Reset

On login success (`OtpVerificationPage` → `onSuccess`):

```ts
setAuthFromSession({ access_token, refresh_token, user });
setShowOtpVerification(false);
setShowRequestOtp(false);
setShowSignIn(false);
setShowOnboarding(false);
```

All auth flags are cleared. The next render shows the main app (Home) with no auth screens in history.

## Gesture Handling

- **Android**: Hardware back button is overridden by `BackHandler.addEventListener`. All back presses are handled; default exit is prevented.
- **iOS**: No hardware back button. Swipe-back is typically provided by a native stack navigator; this app uses modals with `animationType="slide"`. Modal `onRequestClose` can be used where applicable.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| App resumed from background | Back handler stays registered; no special logic. |
| Deep links | Not implemented; would need to integrate with routing. |
| Push notification navigation | Not implemented; would open specific screen via state. |
| Nested navigators | App uses a flat overlay stack; no nested navigators. |

## Performance

- One BackHandler subscription per app lifecycle.
- Subscription is removed on unmount via `return () => sub.remove()`.
- Callbacks use refs to avoid effect re-runs when handlers change.

## Testing Checklist

- [ ] At root (main tabs), back → exit dialog → Cancel closes dialog.
- [ ] At root, back → exit dialog → Exit closes app (Android).
- [ ] With modal open (e.g. Send Invoice), back → modal closes.
- [ ] With nested modals, back → topmost modal closes.
- [ ] Auth: on RequestOtp, back → SignIn.
- [ ] Auth: on OtpVerification, back → RequestOtp.
- [ ] Auth: on SignIn, back → exit dialog.
- [ ] After login, no way to navigate back to auth screens.
- [ ] Exit dialog open, back → dialog closes (no double exit).
