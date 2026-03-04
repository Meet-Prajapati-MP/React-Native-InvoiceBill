import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, BackHandler, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ProfileProvider } from './src/context/ProfileContext';
import { BalanceProvider } from './src/context/BalanceContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import { InvoiceSettingsProvider } from './src/context/InvoiceSettingsContext';
import { NotificationPanel } from './src/components/NotificationPanel';
import { BottomNav } from './src/components/BottomNav';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { HomePage } from './src/pages/HomePage';
import { InvoicesPage } from './src/pages/InvoicesPage';
import { CustomersPage } from './src/pages/CustomersPage';
import { MenuPage } from './src/pages/MenuPage';
import { QuotationsPage } from './src/pages/QuotationsPage';
import { SignInPage } from './src/pages/SignInPage';
import { CreateAccountPage } from './src/pages/CreateAccountPage';
import { OtpVerificationPage } from './src/pages/OtpVerificationPage';
import { RequestOtpPage } from './src/pages/RequestOtpPage';
import { ResetPasswordPage } from './src/pages/ResetPasswordPage';
import { ScanQR } from './src/components/ScanQR';
import { Transfer } from './src/components/Transfer';
import { AddMoney } from './src/components/AddMoney';
import { Withdraw } from './src/components/Withdraw';
import { TransactionDetail } from './src/components/TransactionDetail';
import { SendInvoice } from './src/components/SendInvoice';
import { CreateQuotationFlow } from './src/components/QuotationCreate';
import { CustomerProfile } from './src/components/Profile';
import { MyProfilePage } from './src/pages/MyProfilePage';
import { SubscriptionDetailsPage } from './src/pages/SubscriptionDetailsPage';
import { BankAccountsPage } from './src/pages/BankAccountsPage';
import { ActivityPage } from './src/pages/ActivityPage';
import { BusinessProfilePage } from './src/pages/BusinessProfilePage';
import { InvoiceSettingsPage } from './src/pages/InvoiceSettingsPage';
import { TermsConditionsPage } from './src/pages/TermsConditionsPage';
import { MyAddressesPage } from './src/pages/MyAddressesPage';
import { SendReminderPage } from './src/pages/SendReminderPage';
import { ReportsAnalyticsPage } from './src/pages/ReportsAnalyticsPage';
import { ItemListPage } from './src/pages/ItemListPage';
import { HelpCentrePage } from './src/pages/HelpCentrePage';
import { MessageCentrePage } from './src/pages/MessageCentrePage';
import { VerificationCenterPage } from './src/pages/VerificationCenterPage';
import { PaymentWebView } from './src/components/PaymentWebView';
import { ConfirmDialog } from './src/components/ui/ConfirmDialog';
import { colors } from './src/theme/colors';
import { SplashScreen } from './src/components/SplashScreen';
import { api } from './src/services/api';
import { useAppBackHandler } from './src/hooks/useAppBackHandler';
import { getTopmostBackAction, isAtRoot } from './src/navigation/BackHandlerService';

type Tab = 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';

const ONBOARDING_SEEN_KEY = 'ONBOARDING_SEEN';

function AppContent() {
  const { isAuthenticated, logout, isLoading, setAuthFromSession } = useAuth();
  const { refreshUnreadCount } = useNotifications();
  const [showSplash, setShowSplash] = useState(true);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showRequestOtp, setShowRequestOtp] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [otpFlowMode, setOtpFlowMode] = useState<'forgot-password' | 'login'>('forgot-password');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showScanQR, setShowScanQR] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSendInvoice, setShowSendInvoice] = useState(false);
  const [showCreateQuotation, setShowCreateQuotation] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showSubscriptionDetails, setShowSubscriptionDetails] = useState(false);
  const [showBankAccounts, setShowBankAccounts] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [showInvoiceSettings, setShowInvoiceSettings] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [showMyAddresses, setShowMyAddresses] = useState(false);
  const [showSendReminders, setShowSendReminders] = useState(false);
  const [showReportsAnalytics, setShowReportsAnalytics] = useState(false);
  const [showItemList, setShowItemList] = useState(false);
  const [showHelpCentre, setShowHelpCentre] = useState(false);
  const [showMessageCentre, setShowMessageCentre] = useState(false);
  const [showVerificationCenter, setShowVerificationCenter] = useState(false);
  const [preselectedCustomerForInvoice, setPreselectedCustomerForInvoice] = useState<any>(null);
  const [invoicesRefreshKey, setInvoicesRefreshKey] = useState(0);
  const [quotationsRefreshKey, setQuotationsRefreshKey] = useState(0);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    let cancelled = false;
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then((val) => {
      if (cancelled) return;
      const seen = val === 'true';
      setHasCheckedOnboarding(true);
      if (seen) {
        setShowOnboarding(false);
        setShowSignIn(true);
      }
    });
    return () => { cancelled = true; };
  }, [isLoading, isAuthenticated]);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleNavigate = (action: string) => {
    if (action === 'invoices') setActiveTab('invoices');
    else if (action === 'quotes') setActiveTab('quotes');
    else if (action === 'customers') setActiveTab('customers');
    else if (action === 'scan-qr') setShowScanQR(true);
    else if (action === 'send-payment') setShowTransfer(true);
    else if (action === 'add-money') setShowAddMoney(true);
    else if (action === 'withdraw') setShowWithdraw(true);
  };

  const overlayState = useMemo(
    () => ({
      showExitConfirm,
      showLogoutConfirm,
      showPaymentWebView: !!showPaymentWebView,
      showVerificationCenter,
      showMessageCentre,
      showHelpCentre,
      showItemList,
      showReportsAnalytics,
      showSendReminders,
      showMyAddresses,
      showTermsConditions,
      showInvoiceSettings,
      showBusinessProfile,
      showActivity,
      showBankAccounts,
      showSubscriptionDetails,
      showMyProfile,
      showNotifications,
      showCreateQuotation,
      showSendInvoice,
      showWithdraw,
      showAddMoney,
      showTransfer,
      showScanQR,
      selectedInvoice: !!selectedInvoice,
      selectedQuote: !!selectedQuote,
      selectedCustomer: !!selectedCustomer,
      selectedTransaction: !!selectedTransaction,
    }),
    [
      showExitConfirm,
      showLogoutConfirm,
      showPaymentWebView,
      showVerificationCenter,
      showMessageCentre,
      showHelpCentre,
      showItemList,
      showReportsAnalytics,
      showSendReminders,
      showMyAddresses,
      showTermsConditions,
      showInvoiceSettings,
      showBusinessProfile,
      showActivity,
      showBankAccounts,
      showSubscriptionDetails,
      showMyProfile,
      showNotifications,
      showCreateQuotation,
      showSendInvoice,
      showWithdraw,
      showAddMoney,
      showTransfer,
      showScanQR,
      selectedInvoice,
      selectedQuote,
      selectedCustomer,
      selectedTransaction,
    ],
  );

  const closeFns = useMemo(
    () => ({
      showExitConfirm: () => setShowExitConfirm(false),
      showLogoutConfirm: () => setShowLogoutConfirm(false),
      showPaymentWebView: () => {
        setShowPaymentWebView(false);
        setPaymentRedirectUrl('');
        setSelectedInvoice(null);
      },
      showVerificationCenter: () => setShowVerificationCenter(false),
      showMessageCentre: () => setShowMessageCentre(false),
      showHelpCentre: () => setShowHelpCentre(false),
      showItemList: () => setShowItemList(false),
      showReportsAnalytics: () => setShowReportsAnalytics(false),
      showSendReminders: () => setShowSendReminders(false),
      showMyAddresses: () => setShowMyAddresses(false),
      showTermsConditions: () => setShowTermsConditions(false),
      showInvoiceSettings: () => setShowInvoiceSettings(false),
      showBusinessProfile: () => setShowBusinessProfile(false),
      showActivity: () => setShowActivity(false),
      showBankAccounts: () => setShowBankAccounts(false),
      showSubscriptionDetails: () => setShowSubscriptionDetails(false),
      showMyProfile: () => setShowMyProfile(false),
      showNotifications: () => setShowNotifications(false),
      showCreateQuotation: () => setShowCreateQuotation(false),
      showSendInvoice: () => {
        setShowSendInvoice(false);
        setPreselectedCustomerForInvoice(null);
      },
      showWithdraw: () => setShowWithdraw(false),
      showAddMoney: () => setShowAddMoney(false),
      showTransfer: () => setShowTransfer(false),
      showScanQR: () => setShowScanQR(false),
      selectedInvoice: () => setSelectedInvoice(null),
      selectedQuote: () => setSelectedQuote(null),
      selectedCustomer: () => setSelectedCustomer(null),
      selectedTransaction: () => setSelectedTransaction(null),
    }),
    [],
  );

  const handleMainBack = useCallback(() => {
    const fn = getTopmostBackAction({ overlays: overlayState, closeFns });
    if (fn) fn();
  }, [overlayState, closeFns]);

  const handleAuthBack = useCallback(() => {
    if (showResetPassword) {
      setShowResetPassword(false);
      setShowOtpVerification(true);
    } else if (showOtpVerification) {
      setShowOtpVerification(false);
      setShowRequestOtp(true);
    } else if (showRequestOtp) {
      setShowRequestOtp(false);
      setShowSignIn(true);
    } else if (showCreateAccount) {
      setShowCreateAccount(false);
      setShowSignIn(true);
    }
  }, [showResetPassword, showOtpVerification, showRequestOtp, showCreateAccount]);

  const mainAtRoot = isAtRoot({ overlays: overlayState, closeFns });
  const authAtRoot =
    !showResetPassword &&
    !showOtpVerification &&
    !showRequestOtp &&
    !showCreateAccount;

  useAppBackHandler(
    isAuthenticated ? mainAtRoot : authAtRoot,
    isAuthenticated ? handleMainBack : handleAuthBack,
    () => setShowExitConfirm(true),
  );

  if (showSplash || isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated && !hasCheckedOnboarding) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    if (showResetPassword && resetToken) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <ResetPasswordPage
              resetToken={resetToken}
              onSuccess={() => {
                setResetToken('');
                setShowResetPassword(false);
                setShowSignIn(true);
              }}
              onBack={() => {
                setShowResetPassword(false);
                setShowOtpVerification(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    if (showOtpVerification && forgotPasswordEmail) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <OtpVerificationPage
              email={forgotPasswordEmail}
              mode={otpFlowMode}
              onSuccess={(result) => {
                if (otpFlowMode === 'login' && result.session) {
                  setAuthFromSession({
                    access_token: result.session.access_token,
                    refresh_token: result.session.refresh_token,
                    user: result.user,
                  });
                  setShowOtpVerification(false);
                  setShowRequestOtp(false);
                  setShowSignIn(false);
                  setShowOnboarding(false);
                } else if (result.resetToken) {
                  setResetToken(result.resetToken);
                  setShowOtpVerification(false);
                  setShowResetPassword(true);
                }
              }}
              onBack={() => {
                setShowOtpVerification(false);
                setShowRequestOtp(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    if (showRequestOtp) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <RequestOtpPage
              initialEmail={forgotPasswordEmail}
              mode={otpFlowMode}
              onOtpSent={(email) => {
                setForgotPasswordEmail(email);
                setShowRequestOtp(false);
                setShowOtpVerification(true);
              }}
              onBack={() => {
                setShowRequestOtp(false);
                setShowSignIn(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    if (showCreateAccount) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <CreateAccountPage
              onSuccess={() => {
                setShowCreateAccount(false);
                setShowOnboarding(false);
              }}
              onBack={() => setShowCreateAccount(false)}
              onSignIn={() => {
                setShowCreateAccount(false);
                setShowSignIn(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    if (showSignIn) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <SignInPage
              onSuccess={() => {
                setShowSignIn(false);
                setShowOnboarding(false);
              }}
              onBack={() => setShowSignIn(false)}
              onCreateAccount={() => {
                setShowSignIn(false);
                setShowCreateAccount(true);
              }}
              onForgotPassword={(prefillEmail) => {
                setOtpFlowMode('forgot-password');
                setForgotPasswordEmail(prefillEmail || '');
                setShowSignIn(false);
                setShowRequestOtp(true);
              }}
              onLoginWithOtp={(prefillEmail) => {
                setOtpFlowMode('login');
                setForgotPasswordEmail(prefillEmail || '');
                setShowSignIn(false);
                setShowRequestOtp(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    if (showOnboarding) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <OnboardingScreen
              onComplete={() => {
                markOnboardingSeen();
                setShowOnboarding(false);
                setShowCreateAccount(true);
              }}
              onSignIn={() => {
                markOnboardingSeen();
                setShowSignIn(true);
              }}
              onCreateAccount={() => {
                markOnboardingSeen();
                setShowCreateAccount(true);
              }}
            />
            <StatusBar style="light" />
          </SafeAreaProvider>
        </GestureHandlerRootView>
      );
    }
    // Fallback: never show home or main app when not logged in
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <SignInPage
            onSuccess={() => {
              setShowSignIn(false);
              setShowOnboarding(false);
            }}
            onBack={() => setShowSignIn(false)}
            onCreateAccount={() => {
              setShowSignIn(false);
              setShowCreateAccount(true);
            }}
            onForgotPassword={(prefillEmail) => {
              setOtpFlowMode('forgot-password');
              setForgotPasswordEmail(prefillEmail || '');
              setShowSignIn(false);
              setShowRequestOtp(true);
            }}
            onLoginWithOtp={(prefillEmail) => {
              setOtpFlowMode('login');
              setForgotPasswordEmail(prefillEmail || '');
              setShowSignIn(false);
              setShowRequestOtp(true);
            }}
          />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setShowSignIn(true);
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
      <ProfileProvider>
      <BalanceProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {activeTab === 'home' && (
            <HomePage
              onNavigate={handleNavigate}
              onOpenNotifications={() => setShowNotifications(true)}
              onSelectTransaction={setSelectedTransaction}
              onOpenScanQR={() => setShowScanQR(true)}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesPage
              onCreateInvoice={() => requireAuth(() => setShowSendInvoice(true))}
              onSelectInvoice={setSelectedInvoice}
              refreshKey={invoicesRefreshKey}
            />
          )}
          {activeTab === 'quotes' && (
            <QuotationsPage
              onCreateQuote={() => requireAuth(() => setShowCreateQuotation(true))}
              onSelectQuote={setSelectedQuote}
              refreshKey={quotationsRefreshKey}
            />
          )}
          {activeTab === 'customers' && (
            <CustomersPage
              onSelectCustomer={setSelectedCustomer}
              onBeforeAddCustomer={() => {
                if (!isAuthenticated) {
                  setShowSignIn(true);
                  return false;
                }
                return true;
              }}
            />
          )}
          {activeTab === 'menu' && (
            <MenuPage
              onNavigate={handleNavigate}
              onOpenProfile={() => setShowMyProfile(true)}
              onOpenSubscription={() => setShowSubscriptionDetails(true)}
              onOpenBankAccounts={() => setShowBankAccounts(true)}
              onOpenActivity={() => setShowActivity(true)}
              onOpenBusinessProfile={() => setShowBusinessProfile(true)}
              onOpenInvoiceSettings={() => setShowInvoiceSettings(true)}
              onOpenTermsConditions={() => setShowTermsConditions(true)}
              onOpenMyAddresses={() => setShowMyAddresses(true)}
              onOpenSendReminders={() => setShowSendReminders(true)}
              onOpenReportsAnalytics={() => setShowReportsAnalytics(true)}
              onOpenItemList={() => setShowItemList(true)}
              onOpenHelpCentre={() => setShowHelpCentre(true)}
              onOpenMessageCentre={() => setShowMessageCentre(true)}
              onOpenVerificationCenter={() => setShowVerificationCenter(true)}
              onOpenNotifications={() => setShowNotifications(true)}
              isAuthenticated={isAuthenticated}
              onLogOut={() => setShowLogoutConfirm(true)}
              onSignIn={() => setShowSignIn(true)}
            />
          )}

          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            badges={{ invoices: 1, quotes: 2 }}
          />
        </View>
      </SafeAreaView>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <TransactionDetail
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />

      <CustomerProfile
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
        onSendMoney={() => setShowTransfer(true)}
        onCreateInvoice={() => {
          requireAuth(() => {
            setPreselectedCustomerForInvoice(selectedCustomer);
            setSelectedCustomer(null);
            setShowSendInvoice(true);
          });
        }}
        onSelectTransaction={(tx) => {
          setSelectedCustomer(null);
          setSelectedTransaction(tx);
        }}
        onSelectInvoice={(inv) => {
          setSelectedCustomer(null);
          setSelectedInvoice(inv);
        }}
      />

      {/* Invoice Detail Modal */}
      <Modal visible={!!selectedInvoice} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invoice</Text>
              <TouchableOpacity onPress={() => setSelectedInvoice(null)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            {selectedInvoice && (
              <View style={styles.detailContent}>
                <Text style={styles.detailName}>{selectedInvoice.number}</Text>
                <Text style={styles.detailClient}>{selectedInvoice.client}</Text>
                <Text style={styles.detailAmount}>₹{selectedInvoice.amount?.toLocaleString()}</Text>
                <Text style={styles.detailDate}>{selectedInvoice.date}</Text>
                {paymentError ? (
                  <Text style={styles.paymentError}>{paymentError}</Text>
                ) : null}
                {selectedInvoice.status === 'pending' && selectedInvoice.type === 'sent' && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={async () => {
                      setPaymentError('');
                      const email = selectedInvoice.customerEmail || 'payer@example.com';
                      const phone = selectedInvoice.customerPhone || '9999999999';
                      if (!email || !phone) {
                        setPaymentError('Add customer email & phone to collect payment');
                        return;
                      }
                      try {
                        const { data } = await api.post<{ redirectUrl: string }>('/payments/create', {
                          invoiceId: selectedInvoice.id,
                          payerName: selectedInvoice.client,
                          payerEmail: email,
                          payerMobile: phone,
                          amount: selectedInvoice.amount,
                        });
                        setPaymentRedirectUrl(data.redirectUrl);
                        setShowPaymentWebView(true);
                      } catch (e: unknown) {
                        const err = e as { response?: { data?: { message?: string } }; message?: string };
                        setPaymentError(err?.response?.data?.message || err?.message || 'Failed to init payment');
                      }
                    }}
                  >
                    <Text style={styles.payBtnText}>Pay with SabPaisa</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      <PaymentWebView
        isOpen={showPaymentWebView}
        onClose={() => {
          setShowPaymentWebView(false);
          setPaymentRedirectUrl('');
          setSelectedInvoice(null);
        }}
        onSuccess={() => {
          setSelectedInvoice((prev: any) => (prev ? { ...prev, status: 'paid' } : null));
        }}
        redirectUrl={paymentRedirectUrl}
      />

      {/* Quote Detail Modal */}
      <Modal visible={!!selectedQuote} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quotation</Text>
              <TouchableOpacity onPress={() => setSelectedQuote(null)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            {selectedQuote && (
              <View style={styles.detailContent}>
                <Text style={styles.detailName}>#{selectedQuote.quoNumber || selectedQuote.id}</Text>
                <Text style={styles.detailClient}>{selectedQuote.client}</Text>
                <Text style={styles.detailAmount}>₹{selectedQuote.amount?.toLocaleString()}</Text>
                <Text style={styles.detailDate}>{selectedQuote.date}</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ScanQR isOpen={showScanQR} onClose={() => setShowScanQR(false)} />
      <Transfer isOpen={showTransfer} onClose={() => setShowTransfer(false)} />
      <AddMoney isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} />
      <Withdraw isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} />
      <SendInvoice
        isOpen={showSendInvoice}
        onClose={() => {
          setShowSendInvoice(false);
          setPreselectedCustomerForInvoice(null);
        }}
        onSuccess={async () => {
          setShowSendInvoice(false);
          setPreselectedCustomerForInvoice(null);
          setInvoicesRefreshKey((k) => k + 1);
          try { await refreshUnreadCount(); } catch { /* non-fatal */ }
        }}
        preselectedCustomer={preselectedCustomerForInvoice}
      />
      <CreateQuotationFlow
        isOpen={showCreateQuotation}
        onClose={() => setShowCreateQuotation(false)}
        onSuccess={async () => {
          setShowCreateQuotation(false);
          setQuotationsRefreshKey((k) => k + 1);
          try { await refreshUnreadCount(); } catch { /* non-fatal */ }
        }}
      />
      <MyProfilePage
        isOpen={showMyProfile}
        onClose={() => setShowMyProfile(false)}
      />
      <SubscriptionDetailsPage
        isOpen={showSubscriptionDetails}
        onClose={() => setShowSubscriptionDetails(false)}
      />
      <BankAccountsPage
        isOpen={showBankAccounts}
        onClose={() => setShowBankAccounts(false)}
        onBeforeAddAccount={() => {
          if (!isAuthenticated) {
            setShowSignIn(true);
            setShowBankAccounts(false);
            return false;
          }
          return true;
        }}
      />
      <ActivityPage
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
      />
      <BusinessProfilePage
        isOpen={showBusinessProfile}
        onClose={() => setShowBusinessProfile(false)}
      />
      <InvoiceSettingsPage
        isOpen={showInvoiceSettings}
        onClose={() => setShowInvoiceSettings(false)}
      />
      <TermsConditionsPage
        isOpen={showTermsConditions}
        onClose={() => setShowTermsConditions(false)}
      />
      <MyAddressesPage
        isOpen={showMyAddresses}
        onClose={() => setShowMyAddresses(false)}
      />
      <SendReminderPage
        isOpen={showSendReminders}
        onClose={() => setShowSendReminders(false)}
      />
      <ReportsAnalyticsPage
        isOpen={showReportsAnalytics}
        onClose={() => setShowReportsAnalytics(false)}
        onOpenSendReminders={() => {
          setShowReportsAnalytics(false);
          setShowSendReminders(true);
        }}
      />
      <ItemListPage
        isOpen={showItemList}
        onClose={() => setShowItemList(false)}
        onBeforeAddItem={() => {
          if (!isAuthenticated) {
            setShowSignIn(true);
            setShowItemList(false);
            return false;
          }
          return true;
        }}
      />
      <HelpCentrePage isOpen={showHelpCentre} onClose={() => setShowHelpCentre(false)} />
      <MessageCentrePage isOpen={showMessageCentre} onClose={() => setShowMessageCentre(false)} />
      <VerificationCenterPage isOpen={showVerificationCenter} onClose={() => setShowVerificationCenter(false)} />

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        destructive
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
          setShowSignIn(true);
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        visible={showExitConfirm}
        title="Exit App"
        message="Are you sure you want to exit?"
        confirmLabel="Exit"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowExitConfirm(false);
          if (Platform.OS === 'android') {
            BackHandler.exitApp();
          }
        }}
        onCancel={() => setShowExitConfirm(false)}
      />

      <StatusBar style="dark" />
      </BalanceProvider>
      </ProfileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  splashContainer: { flex: 1, backgroundColor: '#2C264D' },
  safeArea: { flex: 1, backgroundColor: colors.gray100 },
  container: {
    flex: 1,
    maxWidth: 430,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    minHeight: 200,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.navy },
  closeBtn: { fontSize: 16, fontWeight: '600', color: colors.purple },
  modalPlaceholder: { paddingHorizontal: 24, paddingVertical: 24, color: colors.gray500 },
  detailContent: { paddingHorizontal: 24, paddingBottom: 24 },
  detailName: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  detailClient: { fontSize: 16, color: colors.gray600, marginBottom: 8 },
  detailAmount: { fontSize: 28, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  detailDate: { fontSize: 14, color: colors.gray500 },
  detailPhone: { fontSize: 16, color: colors.gray600 },
  paymentError: { fontSize: 14, color: colors.red500, marginTop: 12 },
  payBtn: {
    marginTop: 20,
    backgroundColor: colors.purple,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  customerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.purple100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  customerAvatarText: { fontSize: 24, fontWeight: '700', color: colors.purple },
});

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <InvoiceSettingsProvider>
          <AppContent />
        </InvoiceSettingsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
