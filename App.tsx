import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, BackHandler, Platform, AppState, AppStateStatus, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ProfileProvider, useProfile } from './src/context/ProfileContext';
import { BalanceProvider } from './src/context/BalanceContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import { InvoiceSettingsProvider } from './src/context/InvoiceSettingsContext';
import { NotificationPanel } from './src/components/NotificationPanel';
import { PushRegistration } from './src/components/PushRegistration';
import { BottomNav } from './src/components/BottomNav';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { HomePage } from './src/pages/HomePage';
import { InvoicesPage } from './src/pages/InvoicesPage';
import { CustomersPage } from './src/pages/CustomersPage';
import { MenuPage } from './src/pages/MenuPage';
import { QuotationsPage } from './src/pages/QuotationsPage';
import { SignInPage } from './src/pages/SignInPage';
import { CreateAccountPage } from './src/pages/CreateAccountPage';
import { ForgotPasswordPage } from './src/pages/ForgotPasswordPage';
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
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { api } from './src/services/api';
import { useAppBackHandler } from './src/hooks/useAppBackHandler';
import { SocketManager } from './src/components/SocketManager';
import { on } from './src/services/socket';
import { getTopmostBackAction, isAtRoot } from './src/navigation/BackHandlerService';

type Tab = 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';

const ONBOARDING_SEEN_KEY = 'ONBOARDING_SEEN';

function AppContent() {
  const { isAuthenticated, logout, isLoading, setAuthFromSession } = useAuth();
  const { profile } = useProfile();
  const { refreshUnreadCount } = useNotifications();
  const [showSplash, setShowSplash] = useState(true);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showGuestHome, setShowGuestHome] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
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
  const [customersRefreshKey, setCustomersRefreshKey] = useState(0);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Real-time socket: refresh invoices & notifications on new/updated/paid events
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubNew = on('new_invoice', () => {
      setInvoicesRefreshKey((k) => k + 1);
      refreshUnreadCount().catch(() => {});
    });
    const unsubUpdated = on('invoice_updated', () => {
      setInvoicesRefreshKey((k) => k + 1);
      refreshUnreadCount().catch(() => {});
    });
    const unsubPaid = on('invoice_paid', () => {
      setInvoicesRefreshKey((k) => k + 1);
      refreshUnreadCount().catch(() => {});
    });
    return () => {
      unsubNew();
      unsubUpdated();
      unsubPaid();
    };
  }, [isAuthenticated, refreshUnreadCount]);

  // Refetch when app comes to foreground (catches invoices/quotations created while app was backgrounded)
  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        setInvoicesRefreshKey((k) => k + 1);
        setQuotationsRefreshKey((k) => k + 1);
        setCustomersRefreshKey((k) => k + 1);
      }
    });
    return () => sub.remove();
  }, [isAuthenticated]);

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
        setPaymentError('');
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
    if (showForgotPassword) {
      setShowForgotPassword(false);
      setShowSignIn(true);
    } else if (showCreateAccount) {
      setShowCreateAccount(false);
      setShowSignIn(true);
    }
  }, [showForgotPassword, showCreateAccount]);

  const mainAtRoot = isAtRoot({ overlays: overlayState, closeFns });
  const authAtRoot = !showForgotPassword && !showCreateAccount;

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
    if (showForgotPassword) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <ForgotPasswordPage
              initialEmail={forgotPasswordEmail}
              onSuccess={() => {
                setShowForgotPassword(false);
                setShowSignIn(true);
              }}
              onBack={() => {
                setShowForgotPassword(false);
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
                setShowGuestHome(true);
                setActiveTab('home');
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
              onForgotPassword={(email) => {
                setForgotPasswordEmail(email || '');
                setShowSignIn(false);
                setShowForgotPassword(true);
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
    if (showGuestHome) {
      return (
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <BalanceProvider>
              <SocketManager />
              <PushRegistration isAuthenticated={false} />
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                  <View style={styles.paneWrapper}>
                    <View style={[styles.tabPane, activeTab !== 'home' && styles.tabPaneHidden]}>
                      <HomePage
                        onNavigate={handleNavigate}
                        onOpenNotifications={() => setShowNotifications(true)}
                        onSelectTransaction={setSelectedTransaction}
                        onOpenScanQR={() => setShowScanQR(true)}
                      />
                    </View>
                  </View>
                  <BottomNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    badges={{ invoices: 1, quotes: 2 }}
                  />
                </View>
              </SafeAreaView>
            </BalanceProvider>
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
            onForgotPassword={(email) => {
              setForgotPasswordEmail(email || '');
              setShowSignIn(false);
              setShowForgotPassword(true);
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
      <BalanceProvider>
      <SocketManager />
      <PushRegistration isAuthenticated={isAuthenticated} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.paneWrapper}>
            <View style={[styles.tabPane, activeTab !== 'home' && styles.tabPaneHidden]}>
              <HomePage
              onNavigate={handleNavigate}
              onOpenNotifications={() => setShowNotifications(true)}
              onSelectTransaction={setSelectedTransaction}
              onOpenScanQR={() => setShowScanQR(true)}
            />
          </View>
          <View style={[styles.tabPane, activeTab !== 'invoices' && styles.tabPaneHidden]}>
            <InvoicesPage
              onCreateInvoice={() => requireAuth(() => setShowSendInvoice(true))}
              onSelectInvoice={setSelectedInvoice}
              refreshKey={invoicesRefreshKey}
            />
          </View>
          <View style={[styles.tabPane, activeTab !== 'quotes' && styles.tabPaneHidden]}>
            <QuotationsPage
              onCreateQuote={() => requireAuth(() => setShowCreateQuotation(true))}
              onSelectQuote={setSelectedQuote}
              refreshKey={quotationsRefreshKey}
            />
          </View>
          <View style={[styles.tabPane, activeTab !== 'customers' && styles.tabPaneHidden]}>
            <CustomersPage
              onSelectCustomer={setSelectedCustomer}
              refreshKey={customersRefreshKey}
              onCustomerAdded={() => setCustomersRefreshKey((k) => k + 1)}
              onBeforeAddCustomer={() => {
                if (!isAuthenticated) {
                  setShowSignIn(true);
                  return false;
                }
                return true;
              }}
            />
          </View>
          <View style={[styles.tabPane, activeTab !== 'menu' && styles.tabPaneHidden]}>
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
          </View>
          </View>

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
              <TouchableOpacity onPress={() => { setSelectedInvoice(null); setPaymentError(''); }}>
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
                    style={[styles.payBtn, paymentLoading && styles.payBtnDisabled]}
                    disabled={paymentLoading}
                    onPress={async () => {
                      setPaymentError('');
                      const email = selectedInvoice.customerEmail || '';
                      const phone = selectedInvoice.customerPhone || '';
                      if (!email?.trim() || !phone?.trim()) {
                        setPaymentError('Add customer email & phone to collect payment');
                        return;
                      }
                      const amt = Number(selectedInvoice.amount);
                      if (!Number.isFinite(amt) || amt <= 0) {
                        setPaymentError('Invalid amount');
                        return;
                      }
                      setPaymentLoading(true);
                      try {
                        const { data } = await api.post<{ redirectUrl: string }>('/payments/create', {
                          invoiceId: selectedInvoice.id,
                          payerName: String(selectedInvoice.client || 'Customer').trim(),
                          payerEmail: String(email).trim(),
                          payerMobile: String(phone).replace(/\D/g, '').slice(-10) || phone,
                          amount: amt,
                        });
                        const url = data?.redirectUrl;
                        if (url) {
                          setPaymentRedirectUrl(url);
                          setShowPaymentWebView(true);
                        } else {
                          setPaymentError('Payment gateway did not respond. Please try again.');
                        }
                      } catch (e: unknown) {
                        const err = e as { response?: { data?: { message?: string } }; message?: string };
                        setPaymentError(err?.response?.data?.message || err?.message || 'Failed to init payment');
                      } finally {
                        setPaymentLoading(false);
                      }
                    }}
                  >
                    <Text style={styles.payBtnText}>{paymentLoading ? 'Loading...' : 'Collect Payment'}</Text>
                  </TouchableOpacity>
                )}
                {selectedInvoice.status === 'pending' && selectedInvoice.type === 'received' && (
                  <TouchableOpacity
                    style={[styles.payBtn, paymentLoading && styles.payBtnDisabled]}
                    disabled={paymentLoading}
                    onPress={async () => {
                      setPaymentError('');
                      const email = profile?.email || '';
                      const phone = profile?.phone || '';
                      if (!email?.trim() || !phone?.trim()) {
                        setPaymentError('Add your email & phone in Profile to pay');
                        return;
                      }
                      const amt = Number(selectedInvoice.amount);
                      if (!Number.isFinite(amt) || amt <= 0) {
                        setPaymentError('Invalid amount');
                        return;
                      }
                      setPaymentLoading(true);
                      try {
                        const { data } = await api.post<{ redirectUrl: string }>('/payments/create', {
                          invoiceId: selectedInvoice.id,
                          payerName: String(profile?.full_name || selectedInvoice.client || 'Customer').trim(),
                          payerEmail: String(email).trim(),
                          payerMobile: String(phone).replace(/\D/g, '').slice(-10) || phone,
                          amount: amt,
                        });
                        const url = data?.redirectUrl;
                        if (url) {
                          setPaymentRedirectUrl(url);
                          setShowPaymentWebView(true);
                        } else {
                          setPaymentError('Payment gateway did not respond. Please try again.');
                        }
                      } catch (e: unknown) {
                        const err = e as { response?: { data?: { message?: string } }; message?: string };
                        setPaymentError(err?.response?.data?.message || err?.message || 'Failed to init payment');
                      } finally {
                        setPaymentLoading(false);
                      }
                    }}
                  >
                    <Text style={styles.payBtnText}>{paymentLoading ? 'Loading...' : 'Pay Now'}</Text>
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
          setInvoicesRefreshKey((k) => k + 1);
          setSelectedInvoice((prev: any) => (prev ? { ...prev, status: 'paid' } : null));
        }}
        onError={(msg) => {
          Alert.alert('Payment Error', msg || 'Payment could not be completed. Please try again or contact support.');
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
        customersRefreshKey={customersRefreshKey}
        onClose={() => {
          setShowSendInvoice(false);
          setPreselectedCustomerForInvoice(null);
        }}
        onSuccess={async () => {
          setShowSendInvoice(false);
          setPreselectedCustomerForInvoice(null);
          setInvoicesRefreshKey((k) => k + 1);
          setCustomersRefreshKey((k) => k + 1);
          try { await refreshUnreadCount(); } catch { /* non-fatal */ }
        }}
        preselectedCustomer={preselectedCustomerForInvoice}
      />
      <CreateQuotationFlow
        isOpen={showCreateQuotation}
        customersRefreshKey={customersRefreshKey}
        onClose={() => setShowCreateQuotation(false)}
        onSuccess={async () => {
          setShowCreateQuotation(false);
          setQuotationsRefreshKey((k) => k + 1);
          setCustomersRefreshKey((k) => k + 1);
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
        onNavigateToCustomers={() => {
          setShowReportsAnalytics(false);
          setActiveTab('customers');
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
  paneWrapper: {
    flex: 1,
    position: 'relative',
  },
  tabPane: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabPaneHidden: {
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
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
    alignItems: 'center',
    borderRadius: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
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
    <ErrorBoundary>
      <AuthProvider>
        <ProfileProvider>
          <NotificationProvider>
            <InvoiceSettingsProvider>
              <AppContent />
            </InvoiceSettingsProvider>
          </NotificationProvider>
        </ProfileProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
