export type CloseOverlayFn = () => void;

export interface OverlayState {
  showExitConfirm: boolean;
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

export interface BackHandlerConfig {
  overlays: OverlayState;
  closeFns: Partial<Record<keyof OverlayState, CloseOverlayFn>>;
}

export function getTopmostBackAction(config: BackHandlerConfig): CloseOverlayFn | null {
  const { overlays: o, closeFns } = config;
  if (o.showExitConfirm && closeFns.showExitConfirm) return closeFns.showExitConfirm;
  if (o.showLogoutConfirm && closeFns.showLogoutConfirm) return closeFns.showLogoutConfirm;
  if (o.showPaymentWebView && closeFns.showPaymentWebView) return closeFns.showPaymentWebView;
  if (o.showVerificationCenter && closeFns.showVerificationCenter) return closeFns.showVerificationCenter;
  if (o.showMessageCentre && closeFns.showMessageCentre) return closeFns.showMessageCentre;
  if (o.showHelpCentre && closeFns.showHelpCentre) return closeFns.showHelpCentre;
  if (o.showItemList && closeFns.showItemList) return closeFns.showItemList;
  if (o.showReportsAnalytics && closeFns.showReportsAnalytics) return closeFns.showReportsAnalytics;
  if (o.showSendReminders && closeFns.showSendReminders) return closeFns.showSendReminders;
  if (o.showMyAddresses && closeFns.showMyAddresses) return closeFns.showMyAddresses;
  if (o.showTermsConditions && closeFns.showTermsConditions) return closeFns.showTermsConditions;
  if (o.showInvoiceSettings && closeFns.showInvoiceSettings) return closeFns.showInvoiceSettings;
  if (o.showBusinessProfile && closeFns.showBusinessProfile) return closeFns.showBusinessProfile;
  if (o.showActivity && closeFns.showActivity) return closeFns.showActivity;
  if (o.showBankAccounts && closeFns.showBankAccounts) return closeFns.showBankAccounts;
  if (o.showSubscriptionDetails && closeFns.showSubscriptionDetails) return closeFns.showSubscriptionDetails;
  if (o.showMyProfile && closeFns.showMyProfile) return closeFns.showMyProfile;
  if (o.showNotifications && closeFns.showNotifications) return closeFns.showNotifications;
  if (o.showCreateQuotation && closeFns.showCreateQuotation) return closeFns.showCreateQuotation;
  if (o.showSendInvoice && closeFns.showSendInvoice) return closeFns.showSendInvoice;
  if (o.showWithdraw && closeFns.showWithdraw) return closeFns.showWithdraw;
  if (o.showAddMoney && closeFns.showAddMoney) return closeFns.showAddMoney;
  if (o.showTransfer && closeFns.showTransfer) return closeFns.showTransfer;
  if (o.showScanQR && closeFns.showScanQR) return closeFns.showScanQR;
  if (o.selectedInvoice && closeFns.selectedInvoice) return closeFns.selectedInvoice;
  if (o.selectedQuote && closeFns.selectedQuote) return closeFns.selectedQuote;
  if (o.selectedCustomer && closeFns.selectedCustomer) return closeFns.selectedCustomer;
  if (o.selectedTransaction && closeFns.selectedTransaction) return closeFns.selectedTransaction;
  return null;
}

export function isAtRoot(config: BackHandlerConfig): boolean {
  return getTopmostBackAction(config) === null;
}
