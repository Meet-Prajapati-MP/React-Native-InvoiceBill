/**
 * Navigation stack types for state-based app navigation.
 * Overlays are ordered by z-index (topmost first for back handling).
 */

export type AuthScreen =
  | 'onboarding'
  | 'signIn'
  | 'createAccount'
  | 'requestOtp'
  | 'resetPassword';

/** Screens that must be cleared from history after login */
export const AUTH_SCREENS: AuthScreen[] = [
  'onboarding',
  'signIn',
  'createAccount',
  'requestOtp',
  'resetPassword',
];

export interface AppNavigationState {
  isAuthenticated: boolean;
  activeTab: 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';
  overlays: OverlayState;
}

export interface OverlayState {
  showLogoutConfirm: boolean;
  showPaymentWebView: boolean;
  showVerificationCenter: boolean;
  showMessageCentre: boolean;
  showHelpCentre: boolean;
  showItemList: boolean;
  showReportsAnalytics: boolean;
  showSendReminders: boolean;
  showMyAddresses: boolean;
  showTermsConditions: boolean;
  showInvoiceSettings: boolean;
  showBusinessProfile: boolean;
  showActivity: boolean;
  showBankAccounts: boolean;
  showSubscriptionDetails: boolean;
  showMyProfile: boolean;
  showNotifications: boolean;
  showCreateQuotation: boolean;
  showSendInvoice: boolean;
  showWithdraw: boolean;
  showAddMoney: boolean;
  showTransfer: boolean;
  showScanQR: boolean;
  selectedInvoice: unknown;
  selectedQuote: unknown;
  selectedCustomer: unknown;
  selectedTransaction: unknown;
}
