import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from './src/components/BottomNav';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { HomePage } from './src/pages/HomePage';
import { InvoicesPage } from './src/pages/InvoicesPage';
import { CustomersPage } from './src/pages/CustomersPage';
import { MenuPage } from './src/pages/MenuPage';
import { QuotationsPage } from './src/pages/QuotationsPage';
import { SignInPage } from './src/pages/SignInPage';
import { CreateAccountPage } from './src/pages/CreateAccountPage';
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
import { colors } from './src/theme/colors';

type Tab = 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);

  const handleNavigate = (action: string) => {
    if (action === 'invoices') setActiveTab('invoices');
    else if (action === 'quotes') setActiveTab('quotes');
    else if (action === 'customers') setActiveTab('customers');
    else if (action === 'scan-qr') setShowScanQR(true);
    else if (action === 'send-payment') setShowTransfer(true);
    else if (action === 'add-money') setShowAddMoney(true);
    else if (action === 'withdraw') setShowWithdraw(true);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} resizeMode="cover" />
      </View>
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
            onComplete={() => setShowOnboarding(false)}
            onSignIn={() => setShowSignIn(true)}
            onCreateAccount={() => setShowCreateAccount(true)}
          />
          <StatusBar style="light" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
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
              onCreateInvoice={() => setShowSendInvoice(true)}
              onSelectInvoice={setSelectedInvoice}
            />
          )}
          {activeTab === 'quotes' && (
            <QuotationsPage
              onCreateQuote={() => setShowCreateQuotation(true)}
              onSelectQuote={setSelectedQuote}
            />
          )}
          {activeTab === 'customers' && (
            <CustomersPage onSelectCustomer={setSelectedCustomer} />
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
              onLogOut={() => setShowSignIn(true)}
            />
          )}

          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            badges={{ invoices: 1, quotes: 2 }}
          />
        </View>
      </SafeAreaView>

      {/* Notification Panel Modal */}
      <Modal visible={showNotifications} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalPlaceholder}>No new notifications</Text>
          </View>
        </View>
      </Modal>

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
          setPreselectedCustomerForInvoice(selectedCustomer);
          setSelectedCustomer(null);
          setShowSendInvoice(true);
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
              </View>
            )}
          </View>
        </View>
      </Modal>

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
        preselectedCustomer={preselectedCustomerForInvoice}
      />
      <CreateQuotationFlow
        isOpen={showCreateQuotation}
        onClose={() => setShowCreateQuotation(false)}
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
      <ItemListPage isOpen={showItemList} onClose={() => setShowItemList(false)} />
      <HelpCentrePage isOpen={showHelpCentre} onClose={() => setShowHelpCentre(false)} />
      <MessageCentrePage isOpen={showMessageCentre} onClose={() => setShowMessageCentre(false)} />
      <VerificationCenterPage isOpen={showVerificationCenter} onClose={() => setShowVerificationCenter(false)} />

      <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splashContainer: { flex: 1, backgroundColor: '#2C264D' },
  splashImage: { width: '100%', height: '100%' },
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
