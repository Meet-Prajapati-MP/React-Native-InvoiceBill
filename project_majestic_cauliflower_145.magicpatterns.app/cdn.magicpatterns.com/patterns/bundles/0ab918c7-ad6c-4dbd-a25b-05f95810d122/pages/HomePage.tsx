import React, { useState } from 'react';
import { Bell, ArrowUpRight, ScanLine, Wallet, Send, QrCode, X, Copy, Check, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatINR } from '../lib/utils';
interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'sent' | 'received';
  status: 'completed' | 'pending';
  invoiceRef?: string;
  note?: string;
  milestone?: {
    current: number;
    total: number;
  };
}
const transactions: Transaction[] = [{
  id: '1',
  name: 'Priya Sharma',
  date: 'Today, 10:23 AM',
  amount: 15000,
  type: 'received',
  status: 'completed',
  invoiceRef: 'INV-006',
  note: 'Website Design',
  milestone: {
    current: 2,
    total: 3
  }
}, {
  id: '2',
  name: 'Rahul Verma',
  date: 'Yesterday, 4:45 PM',
  amount: 2500,
  type: 'sent',
  status: 'completed',
  invoiceRef: 'INV-007',
  note: 'Logo Design'
}, {
  id: '3',
  name: 'Design Studio',
  date: 'Oct 24, 2:30 PM',
  amount: 45000,
  type: 'received',
  status: 'completed',
  invoiceRef: 'INV-002',
  note: 'Full Payment'
}, {
  id: '4',
  name: 'Neha Patel',
  date: 'Oct 23, 9:15 AM',
  amount: 1200,
  type: 'sent',
  status: 'completed',
  note: 'Reimbursement'
}, {
  id: '5',
  name: 'Tech Solutions',
  date: 'Oct 21, 11:00 AM',
  amount: 8500,
  type: 'received',
  status: 'completed',
  invoiceRef: 'INV-003',
  note: 'Consulting',
  milestone: {
    current: 1,
    total: 2
  }
}];
interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenNotifications: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}
export function HomePage({
  onNavigate,
  onOpenNotifications,
  onSelectTransaction
}: HomePageProps) {
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  // Generate a simple QR-like grid for visual placeholder
  const qrGrid = Array.from({
    length: 100
  }).map((_, i) => {
    const isCorner = i < 30 && i % 10 < 3 ||
    // Top left
    i < 30 && i % 10 > 6 ||
    // Top right
    i > 69 && i % 10 < 3; // Bottom left
    const isRandom = Math.random() > 0.5;
    return isCorner || isRandom;
  });
  return <div className="flex flex-col min-h-screen bg-white pb-24" data-id="element-3796">
      {/* Header */}
      <header className="px-6 pt-12 pb-2 flex justify-between items-center bg-white sticky top-0 z-10" data-id="element-3797">
        <div data-id="element-3798">
          <h1 className="text-lg font-bold text-trustopay-navy" data-id="element-3799">Arjun Mehta</h1>
        </div>
        <div className="flex items-center gap-3" data-id="element-3800">
          <button onClick={onOpenNotifications} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center relative hover:bg-gray-100" data-id="element-3801">
            <Bell className="w-5 h-5 text-trustopay-navy" data-id="element-3802" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" data-id="element-3803"></span>
          </button>
          <button onClick={() => setShowQROverlay(true)} className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-trustopay-purple hover:bg-purple-200 transition-colors" data-id="element-3804">
            <QrCode size={20} data-id="element-3805" />
          </button>
        </div>
      </header>

      {/* QR Overlay */}
      <AnimatePresence data-id="element-3806">
        {showQROverlay && <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6" data-id="element-3807">
            <button onClick={() => setShowQROverlay(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200" data-id="element-3808">
              <X size={24} className="text-gray-600" data-id="element-3809" />
            </button>

            <h2 className="text-2xl font-bold text-trustopay-navy mb-8" data-id="element-3810">
              Your Payment QR
            </h2>

            <div className="w-64 h-64 bg-white border-4 border-trustopay-purple rounded-3xl p-4 shadow-xl mb-8 relative overflow-hidden" data-id="element-3811">
              {/* QR Visual Placeholder */}
              <div className="w-full h-full grid grid-cols-10 gap-1" data-id="element-3812">
                {qrGrid.map((filled, i) => <div key={i} className={`rounded-sm ${filled ? 'bg-trustopay-navy' : 'bg-transparent'}`} data-id="element-3813" />)}
              </div>
              {/* Center Logo */}
              <div className="absolute inset-0 flex items-center justify-center" data-id="element-3814">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md" data-id="element-3815">
                  <div className="w-8 h-8 bg-trustopay-purple rounded-full flex items-center justify-center text-white font-bold text-xs" data-id="element-3816">
                    TP
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-8" data-id="element-3817">
              <p className="text-gray-500 text-sm mb-2" data-id="element-3818">UPI ID</p>
              <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full" data-id="element-3819">
                <span className="font-bold text-trustopay-navy text-lg" data-id="element-3820">
                  arjun@trustopay
                </span>
              </div>
            </div>

            <Button onClick={handleCopy} className="w-full max-w-xs gap-2" variant={copied ? 'outline' : 'default'} data-id="element-3821">
              {copied ? <Check size={18} data-id="element-3822" /> : <Copy size={18} data-id="element-3823" />}
              {copied ? 'Copied!' : 'Copy UPI ID'}
            </Button>
          </motion.div>}
      </AnimatePresence>

      <div className="px-6 space-y-6 mt-4" data-id="element-3824">
        {/* Balance + Quick Actions */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="space-y-5" data-id="element-3825">
          {/* Balance */}
          <div className="text-center pt-2" data-id="element-3826">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1" data-id="element-3827">
              Total Balance
            </p>
            <div className="flex items-center justify-center gap-2" data-id="element-3828">
              <h2 className="text-4xl font-bold text-trustopay-navy" data-id="element-3829">
                {formatINR(12650)}
              </h2>
              <Eye size={18} className="text-gray-300 cursor-pointer" data-id="element-3830" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-3" data-id="element-3831">
            {[{
            icon: ScanLine,
            label: 'Scan QR',
            action: () => onNavigate('scan-qr')
          }, {
            icon: Send,
            label: 'Transfer',
            action: () => onNavigate('send-payment')
          }, {
            icon: Wallet,
            label: 'Add Money',
            action: () => onNavigate('add-money')
          }, {
            icon: ArrowUpRight,
            label: 'Withdraw',
            action: () => onNavigate('withdraw')
          }].map((item, index) => {
            const Icon = item.icon;
            return <motion.button key={item.label} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.1 + index * 0.05
            }} onClick={item.action} className="flex flex-col items-center gap-2 group" data-id="element-3832">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-trustopay-purple transition-colors group-active:bg-purple-100" data-id="element-3833">
                    <Icon size={22} data-id="element-3834" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500" data-id="element-3835">
                    {item.label}
                  </span>
                </motion.button>;
          })}
          </div>
        </motion.div>

        {/* Promo Banner */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        delay: 0.3
      }} data-id="element-3836">
          <div className="w-full h-32 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] p-5 flex flex-col justify-center relative overflow-hidden shadow-lg shadow-purple-100" data-id="element-3837">
            <div className="relative z-10 text-white max-w-[95%]" data-id="element-3838">
              <h3 className="font-bold text-xl leading-tight mb-1 flex items-center gap-2" data-id="element-3839">
                Crafted with ❤️ in Gujarat
                <Sparkles size={16} className="text-yellow-300 animate-pulse" data-id="element-3840" />
              </h3>
              <p className="text-purple-100 text-xs font-medium leading-relaxed max-w-[80%]" data-id="element-3841">
                Built to Empower MSMEs & SoloPreneurs Like You
              </p>
            </div>

            {/* Tricolor Accent */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 flex" data-id="element-3842">
              <div className="flex-1 bg-[#FF9933]" data-id="element-3843"></div>
              <div className="flex-1 bg-white" data-id="element-3844"></div>
              <div className="flex-1 bg-[#138808]" data-id="element-3845"></div>
            </div>

            {/* Decorative circles */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full translate-x-10 translate-y-10" data-id="element-3846" />
            <div className="absolute right-10 top-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8" data-id="element-3847" />
            <div className="absolute left-10 bottom-10 w-4 h-4 bg-yellow-300/30 rounded-full blur-sm" data-id="element-3848" />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="space-y-4" data-id="element-3849">
          <div className="flex justify-between items-center" data-id="element-3850">
            <h3 className="font-bold text-trustopay-navy text-lg" data-id="element-3851">
              Transaction
            </h3>
            <button className="text-gray-400 text-sm font-medium hover:text-trustopay-purple" data-id="element-3852">
              View All
            </button>
          </div>

          <div className="space-y-3 pb-4" data-id="element-3853">
            {transactions.map((tx, index) => <motion.div key={tx.id} initial={{
            opacity: 0,
            x: -10
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.4 + index * 0.1
          }} onClick={() => onSelectTransaction(tx)} className="cursor-pointer group" data-id="element-3854">
                <div className="p-3.5 rounded-xl border border-gray-100 group-active:border-trustopay-purple/30 transition-colors" data-id="element-3855">
                  <div className="flex items-center gap-3" data-id="element-3856">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${tx.type === 'received' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-trustopay-purple'}`} data-id="element-3857">
                      {tx.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0" data-id="element-3858">
                      <div className="flex justify-between items-start mb-0.5" data-id="element-3859">
                        <p className="font-bold text-trustopay-navy text-sm truncate pr-2" data-id="element-3860">
                          {tx.invoiceRef && <span data-id="element-3861">{tx.invoiceRef} • </span>}
                          <span className="font-medium text-gray-600" data-id="element-3862">
                            {tx.name}
                          </span>
                        </p>
                        <p className={`font-bold text-sm flex-shrink-0 ${tx.type === 'received' ? 'text-green-600' : 'text-red-500'}`} data-id="element-3863">
                          {tx.type === 'received' ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400" data-id="element-3864">
                        {tx.milestone ? `Milestone ${tx.milestone.current}/${tx.milestone.total} Paid` : tx.note || 'Payment'}
                        {tx.status === 'pending' && <span className="text-amber-500 font-medium" data-id="element-3865">
                            {' '}
                            • Pending
                          </span>}
                        {tx.status === 'completed' && <span data-id="element-3866"> • {tx.date}</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>
    </div>;
}