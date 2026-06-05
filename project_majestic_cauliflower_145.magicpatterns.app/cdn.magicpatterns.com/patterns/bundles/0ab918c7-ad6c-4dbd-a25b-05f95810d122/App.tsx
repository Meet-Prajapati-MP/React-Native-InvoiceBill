import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { InvoicesPage } from './pages/InvoicesPage';
import { CustomersPage } from './pages/CustomersPage';
import { MenuPage } from './pages/MenuPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { CreateQuotationFlow } from './components/CreateQuotationFlow';
import { QuotationDetail } from './components/QuotationDetail';
import { ConvertToInvoiceModal } from './components/ConvertToInvoiceModal';
import { SendInvoiceFlow } from './components/SendInvoiceFlow';
import { NotificationPanel } from './components/NotificationPanel';
import { TransactionDetail } from './components/TransactionDetail';
import { CustomerProfile } from './components/CustomerProfile';
import { InvoiceDetail } from './components/InvoiceDetail';
import { RecurringInvoiceDetail } from './components/RecurringInvoiceDetail';
import { ScanQR } from './components/ScanQR';
import { SendPayment } from './components/SendPayment';
import { AddMoney } from './components/AddMoney';
import { WithdrawFlow } from './components/WithdrawFlow';
import { InvoiceDiscounting } from './components/InvoiceDiscounting';
import { PaymentOptions } from './components/PaymentOptions';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AnimatePresence, motion } from 'framer-motion';
export function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'invoices' | 'quotes' | 'customers' | 'menu'>('home');
  // Overlay States
  const [showSendInvoice, setShowSendInvoice] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showScanQR, setShowScanQR] = useState(false);
  const [showSendPayment, setShowSendPayment] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  // Selection States
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedRecurring, setSelectedRecurring] = useState<any>(null);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [invoiceAction, setInvoiceAction] = useState<'discount' | 'pay' | null>(null);
  const handleNavigate = (action: string) => {
    switch (action) {
      case 'invoices':
        setActiveTab('invoices');
        break;
      case 'quotes':
        setActiveTab('quotes');
        break;
      case 'customers':
        setActiveTab('customers');
        break;
      case 'send-invoice':
        setShowSendInvoice(true);
        break;
      case 'create-quote':
        setShowCreateQuote(true);
        break;
      case 'send-payment':
        setShowSendPayment(true);
        break;
      case 'scan-qr':
        setShowScanQR(true);
        break;
      case 'add-money':
        setShowAddMoney(true);
        break;
      case 'withdraw':
        setShowWithdraw(true);
        break;
    }
  };
  return <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans" data-id="element-0">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col" data-id="element-1">
        {showOnboarding ? <OnboardingScreen onComplete={() => setShowOnboarding(false)} data-id="element-2" /> : <>
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar" data-id="element-3">
              <AnimatePresence mode="wait" data-id="element-4">
                {activeTab === 'home' && <motion.div key="home" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.2
            }} data-id="element-5">
                    <HomePage onNavigate={handleNavigate} onOpenNotifications={() => setShowNotifications(true)} onSelectTransaction={setSelectedTransaction} data-id="element-6" />
                  </motion.div>}
                {activeTab === 'invoices' && <motion.div key="invoices" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.2
            }} data-id="element-7">
                    <InvoicesPage onSelectInvoice={setSelectedInvoice} onSelectRecurring={setSelectedRecurring} onCreateInvoice={() => setShowSendInvoice(true)} onAction={(inv, action) => {
                setSelectedInvoice(inv);
                setInvoiceAction(action);
              }} data-id="element-8" />
                  </motion.div>}
                {activeTab === 'quotes' && <motion.div key="quotes" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.2
            }} data-id="element-9">
                    <QuotationsPage onSelectQuote={setSelectedQuote} onCreateQuote={() => setShowCreateQuote(true)} data-id="element-10" />
                  </motion.div>}
                {activeTab === 'customers' && <motion.div key="customers" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.2
            }} data-id="element-11">
                    <CustomersPage onSelectCustomer={setSelectedCustomer} data-id="element-12" />
                  </motion.div>}
                {activeTab === 'menu' && <motion.div key="menu" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.2
            }} data-id="element-13">
                    <MenuPage onNavigate={handleNavigate} data-id="element-14" />
                  </motion.div>}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} badges={{
          invoices: 1,
          quotes: 2
        }} data-id="element-15" />

            {/* Overlays */}
            <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} data-id="element-16" />

            <TransactionDetail isOpen={!!selectedTransaction} onClose={() => setSelectedTransaction(null)} transaction={selectedTransaction} data-id="element-17" />

            <CustomerProfile isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} customer={selectedCustomer} onSendMoney={() => {
          setShowSendPayment(true);
          // Pass customer to payment flow
        }} onCreateInvoice={() => {
          setShowSendInvoice(true);
          // Pass customer to invoice flow
        }} onSelectTransaction={setSelectedTransaction} onSelectInvoice={invId => {
          // Mock finding invoice by ID
          const mockInvoice = {
            id: invId,
            number: invId,
            client: selectedCustomer?.name || 'Client',
            amount: 15000,
            date: 'Oct 10, 2023',
            status: 'sent',
            type: 'sent'
          };
          setSelectedInvoice(mockInvoice);
        }} data-id="element-18" />

            <InvoiceDetail isOpen={!!selectedInvoice && !invoiceAction} onClose={() => setSelectedInvoice(null)} invoice={selectedInvoice} data-id="element-19" />

            <RecurringInvoiceDetail isOpen={!!selectedRecurring} onClose={() => setSelectedRecurring(null)} recurringInvoice={selectedRecurring} data-id="element-20" />

            <CreateQuotationFlow isOpen={showCreateQuote} onClose={() => setShowCreateQuote(false)} data-id="element-21" />

            <QuotationDetail isOpen={!!selectedQuote} onClose={() => setSelectedQuote(null)} quote={selectedQuote} onConvertToInvoice={() => setShowConvertModal(true)} data-id="element-22" />

            <ConvertToInvoiceModal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} quote={selectedQuote} onConfirm={() => {
          setShowConvertModal(false);
          setSelectedQuote(null);
          // In a real app, this would navigate to the new invoice
          setActiveTab('invoices');
        }} data-id="element-23" />

            {/* Invoice Actions */}
            {selectedInvoice && invoiceAction === 'discount' && <InvoiceDiscounting isOpen={true} onClose={() => {
          setInvoiceAction(null);
          setSelectedInvoice(null);
        }} invoiceAmount={selectedInvoice.amount} data-id="element-24" />}

            {selectedInvoice && invoiceAction === 'pay' && <PaymentOptions isOpen={true} onClose={() => {
          setInvoiceAction(null);
          setSelectedInvoice(null);
        }} amount={selectedInvoice.amount} invoiceId={selectedInvoice.number} data-id="element-25" />}

            <ScanQR isOpen={showScanQR} onClose={() => setShowScanQR(false)} data-id="element-26" />

            <SendPayment isOpen={showSendPayment} onClose={() => setShowSendPayment(false)} recipient={selectedCustomer} data-id="element-27" />

            <AddMoney isOpen={showAddMoney} onClose={() => setShowAddMoney(false)} data-id="element-28" />

            <WithdrawFlow isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} data-id="element-29" />

            <AnimatePresence data-id="element-30">
              {showSendInvoice && <motion.div initial={{
            y: '100%'
          }} animate={{
            y: 0
          }} exit={{
            y: '100%'
          }} transition={{
            type: 'spring',
            damping: 25,
            stiffness: 300
          }} className="fixed inset-0 z-50 flex justify-center" data-id="element-31">
                  <SendInvoiceFlow isOpen={showSendInvoice} onClose={() => setShowSendInvoice(false)} preselectedCustomer={selectedCustomer} data-id="element-32" />
                </motion.div>}
            </AnimatePresence>
          </>}
      </div>
    </div>;
}