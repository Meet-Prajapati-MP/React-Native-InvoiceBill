import React, { useEffect, useState } from 'react';
import { X, CreditCard, Check, ArrowLeft, Wallet, Building2, Smartphone, Globe, Lock, Shield, ChevronRight, AlertCircle, CheckCircle2, XCircle, Zap, Eye, EyeOff, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { formatINR, cn } from '../lib/utils';
interface PaymentOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceId: string;
  sellerName?: string;
}
type PaymentMethod = 'wallet' | 'upi' | 'card' | 'netbanking' | 'paypal';
type FlowStep = 'select' | 'detail' | 'pin' | 'processing' | 'success' | 'failure';
const WALLET_BALANCE = 12650;
const METHODS = [{
  id: 'wallet' as const,
  icon: Wallet,
  name: 'Trustopay Balance',
  desc: `Available: ${formatINR(WALLET_BALANCE)}`,
  fee: 0,
  feeLabel: 'FREE',
  speed: 'Instant',
  color: 'bg-trustopay-purple text-white'
}, {
  id: 'upi' as const,
  icon: Smartphone,
  name: 'UPI',
  desc: 'PhonePe, GPay, Paytm',
  fee: 0,
  feeLabel: 'FREE',
  speed: 'Instant',
  color: 'bg-green-600 text-white'
}, {
  id: 'card' as const,
  icon: CreditCard,
  name: 'Debit / Credit Card',
  desc: 'Visa, Mastercard, Amex',
  fee: 2,
  feeLabel: '2% fee',
  speed: 'Instant',
  color: 'bg-blue-600 text-white'
}, {
  id: 'netbanking' as const,
  icon: Building2,
  name: 'Net Banking',
  desc: 'All major banks',
  fee: 0,
  feeLabel: 'FREE',
  speed: '2–5 min',
  color: 'bg-gray-700 text-white'
}, {
  id: 'paypal' as const,
  icon: Globe,
  name: 'PayPal',
  desc: 'International payments',
  fee: 3,
  feeLabel: '3% fee',
  speed: 'Instant',
  color: 'bg-[#003087] text-white'
}];
const UPI_APPS = [{
  id: 'phonepe',
  name: 'PhonePe',
  color: 'bg-purple-600'
}, {
  id: 'gpay',
  name: 'GPay',
  color: 'bg-blue-500'
}, {
  id: 'paytm',
  name: 'Paytm',
  color: 'bg-sky-500'
}, {
  id: 'bhim',
  name: 'BHIM',
  color: 'bg-green-700'
}, {
  id: 'amazon',
  name: 'Amazon',
  color: 'bg-orange-500'
}, {
  id: 'other',
  name: 'Other',
  color: 'bg-gray-500'
}];
const POPULAR_BANKS = [{
  id: 'sbi',
  name: 'SBI',
  color: 'bg-blue-700'
}, {
  id: 'hdfc',
  name: 'HDFC',
  color: 'bg-blue-900'
}, {
  id: 'icici',
  name: 'ICICI',
  color: 'bg-orange-600'
}, {
  id: 'axis',
  name: 'Axis',
  color: 'bg-purple-800'
}, {
  id: 'kotak',
  name: 'Kotak',
  color: 'bg-red-600'
}, {
  id: 'bob',
  name: 'BOB',
  color: 'bg-orange-700'
}];
export function PaymentOptions({
  isOpen,
  onClose,
  amount,
  invoiceId,
  sellerName = 'Ankit Shah'
}: PaymentOptionsProps) {
  const [step, setStep] = useState<FlowStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(WALLET_BALANCE >= amount ? 'wallet' : 'upi');
  const [paymentNote, setPaymentNote] = useState('');
  const [failureReason, setFailureReason] = useState('');
  // UPI state
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [upiMode, setUpiMode] = useState<'app' | 'id'>('app');
  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [saveCard, setSaveCard] = useState(true);
  const [useSavedCard, setUseSavedCard] = useState(true);
  // Net Banking state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [bankSearch, setBankSearch] = useState('');
  // PIN state
  const [pin, setPin] = useState('');
  // Processing state
  const [processingProgress, setProcessingProgress] = useState(0);
  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  // Transaction ID
  const txnId = `TXN-${Date.now().toString().slice(-10)}`;
  useEffect(() => {
    if (!isOpen) {
      // Reset all state
      setTimeout(() => {
        setStep('select');
        setSelectedMethod(WALLET_BALANCE >= amount ? 'wallet' : 'upi');
        setPaymentNote('');
        setPin('');
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCvv('');
        setSelectedUpiApp(null);
        setUpiId('');
        setSelectedBank(null);
        setProcessingProgress(0);
        setShowConfetti(false);
      }, 300);
    }
  }, [isOpen, amount]);
  const methodInfo = METHODS.find(m => m.id === selectedMethod)!;
  const feeAmount = Math.round(amount * (methodInfo.fee / 100));
  const totalAmount = amount + feeAmount;
  const detectCardType = (num: string) => {
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'Mastercard';
    if (num.startsWith('3')) return 'Amex';
    return null;
  };
  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    return clean.replace(/(.{4})/g, '$1 ').trim();
  };
  const handleContinue = () => {
    if (selectedMethod === 'wallet') {
      setStep('pin');
    } else {
      setStep('detail');
    }
  };
  const handlePayFromDetail = () => {
    if (selectedMethod === 'upi' || selectedMethod === 'card') {
      setStep('pin');
    } else {
      startProcessing();
    }
  };
  const handlePinSubmit = () => {
    if (pin.length === 4) {
      startProcessing();
    }
  };
  const startProcessing = () => {
    setStep('processing');
    setProcessingProgress(0);
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
    // Simulate success after ~2s
    setTimeout(() => {
      clearInterval(interval);
      setProcessingProgress(100);
      setShowConfetti(true);
      setStep('success');
      setTimeout(() => setShowConfetti(false), 3000);
    }, 2200);
  };
  const handleRetry = () => {
    setStep('select');
    setPin('');
  };
  if (!isOpen) return null;
  return <AnimatePresence data-id="element-1634">
      {isOpen && <>
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} onClick={step === 'processing' ? undefined : onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" data-id="element-1635" />

          <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className={cn('fixed bottom-0 left-0 right-0 bg-white z-50 max-w-[430px] mx-auto overflow-hidden flex flex-col', step === 'processing' || step === 'success' || step === 'failure' ? 'rounded-none inset-0' : 'rounded-t-3xl max-h-[92vh]')} data-id="element-1636">
            {/* ═══ STEP: METHOD SELECTION ═══ */}
            {step === 'select' && <>
                <div className="p-5 flex-1 overflow-y-auto" data-id="element-1637">
                  <div className="flex justify-between items-start mb-5" data-id="element-1638">
                    <div data-id="element-1639">
                      <h2 className="text-xl font-bold text-trustopay-navy" data-id="element-1640">
                        Pay Invoice
                      </h2>
                      <p className="text-sm text-gray-500" data-id="element-1641">
                        #{invoiceId} • To {sellerName}
                      </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full -mr-2" data-id="element-1642">
                      <X size={22} className="text-gray-400" data-id="element-1643" />
                    </button>
                  </div>

                  {/* Amount Display */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center" data-id="element-1644">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1" data-id="element-1645">
                      Amount Due
                    </p>
                    <p className="text-3xl font-bold text-trustopay-navy" data-id="element-1646">
                      {formatINR(amount)}
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-1647">
                    Select Payment Method
                  </p>
                  <div className="space-y-2.5 mb-5" data-id="element-1648">
                    {METHODS.map((method, i) => {
                const isSelected = selectedMethod === method.id;
                const Icon = method.icon;
                const insufficientBalance = method.id === 'wallet' && WALLET_BALANCE < amount;
                return <motion.button key={method.id} initial={{
                  opacity: 0,
                  y: 8
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  delay: i * 0.04
                }} onClick={() => !insufficientBalance && setSelectedMethod(method.id)} disabled={insufficientBalance} className={cn('w-full p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all', isSelected ? 'border-trustopay-purple bg-purple-50/40' : 'border-gray-100', insufficientBalance && 'opacity-50 cursor-not-allowed')} data-id="element-1649">
                          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', method.color)} data-id="element-1650">
                            <Icon size={20} data-id="element-1651" />
                          </div>
                          <div className="flex-1 min-w-0" data-id="element-1652">
                            <div className="flex items-center gap-2" data-id="element-1653">
                              <p className="font-bold text-sm text-trustopay-navy" data-id="element-1654">
                                {method.name}
                              </p>
                              {i === 0 && !insufficientBalance && <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full" data-id="element-1655">
                                  BEST
                                </span>}
                            </div>
                            <p className="text-[11px] text-gray-500" data-id="element-1656">
                              {method.desc}
                            </p>
                            {insufficientBalance && <p className="text-[10px] text-red-500 font-medium" data-id="element-1657">
                                Insufficient balance
                              </p>}
                          </div>
                          <div className="text-right flex-shrink-0" data-id="element-1658">
                            <p className={cn('text-[10px] font-bold', method.fee === 0 ? 'text-green-600' : 'text-gray-500')} data-id="element-1659">
                              {method.feeLabel}
                            </p>
                            <p className="text-[9px] text-gray-400" data-id="element-1660">
                              {method.speed}
                            </p>
                          </div>
                          {isSelected && <div className="w-5 h-5 rounded-full bg-trustopay-purple flex items-center justify-center flex-shrink-0" data-id="element-1661">
                              <Check size={12} className="text-white" data-id="element-1662" />
                            </div>}
                        </motion.button>;
              })}
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center gap-2 justify-center py-2" data-id="element-1663">
                    <Lock size={12} className="text-gray-400" data-id="element-1664" />
                    <p className="text-[10px] text-gray-400" data-id="element-1665">
                      Payments are secure and encrypted
                    </p>
                    <Shield size={12} className="text-gray-400" data-id="element-1666" />
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white" data-id="element-1667">
                  <Button className="w-full h-13 text-base" onClick={handleContinue} data-id="element-1668">
                    Continue to Payment
                  </Button>
                </div>
              </>}

            {/* ═══ STEP: METHOD DETAIL ═══ */}
            {step === 'detail' && <>
                <div className="p-5 flex-1 overflow-y-auto" data-id="element-1669">
                  <div className="flex items-center gap-3 mb-5" data-id="element-1670">
                    <button onClick={() => setStep('select')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-1671">
                      <ArrowLeft size={22} className="text-trustopay-navy" data-id="element-1672" />
                    </button>
                    <div data-id="element-1673">
                      <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-1674">
                        Pay via {methodInfo.name}
                      </h2>
                      <p className="text-xs text-gray-500" data-id="element-1675">
                        {formatINR(amount)} to {sellerName}
                      </p>
                    </div>
                  </div>

                  {/* ── UPI Detail ── */}
                  {selectedMethod === 'upi' && <div className="space-y-5" data-id="element-1676">
                      <div className="flex bg-gray-100 rounded-lg p-1" data-id="element-1677">
                        <button onClick={() => setUpiMode('app')} className={cn('flex-1 py-2 rounded-md text-xs font-medium transition-all', upiMode === 'app' ? 'bg-white shadow-sm text-trustopay-navy' : 'text-gray-500')} data-id="element-1678">
                          Select App
                        </button>
                        <button onClick={() => setUpiMode('id')} className={cn('flex-1 py-2 rounded-md text-xs font-medium transition-all', upiMode === 'id' ? 'bg-white shadow-sm text-trustopay-navy' : 'text-gray-500')} data-id="element-1679">
                          Enter UPI ID
                        </button>
                      </div>

                      {upiMode === 'app' ? <div className="grid grid-cols-3 gap-3" data-id="element-1680">
                          {UPI_APPS.map(app => <button key={app.id} onClick={() => setSelectedUpiApp(app.id)} className={cn('p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all', selectedUpiApp === app.id ? 'border-trustopay-purple bg-purple-50' : 'border-gray-100')} data-id="element-1681">
                              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-bold', app.color)} data-id="element-1682">
                                {app.name.slice(0, 2).toUpperCase()}
                              </div>
                              <p className="text-[11px] font-medium text-trustopay-navy" data-id="element-1683">
                                {app.name}
                              </p>
                            </button>)}
                        </div> : <div className="space-y-3" data-id="element-1684">
                          <Input label="UPI ID" placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} data-id="element-1685" />
                          {upiId && upiId.includes('@') && <div className="flex items-center gap-2 text-green-600 text-xs" data-id="element-1686">
                              <CheckCircle2 size={14} data-id="element-1687" /> Valid UPI ID format
                            </div>}
                        </div>}

                      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex items-start gap-2" data-id="element-1688">
                        <Smartphone size={14} className="mt-0.5 flex-shrink-0" data-id="element-1689" />
                        <span data-id="element-1690">
                          You'll receive a notification in your UPI app to
                          approve the payment.
                        </span>
                      </div>
                    </div>}

                  {/* ── Card Detail ── */}
                  {selectedMethod === 'card' && <div className="space-y-4" data-id="element-1691">
                      {/* Saved Card */}
                      <div data-id="element-1692">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" data-id="element-1693">
                          Saved Cards
                        </p>
                        <button onClick={() => setUseSavedCard(!useSavedCard)} className={cn('w-full p-3.5 rounded-xl border-2 flex items-center gap-3 text-left transition-all', useSavedCard ? 'border-trustopay-purple bg-purple-50/40' : 'border-gray-100')} data-id="element-1694">
                          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold" data-id="element-1695">
                            VISA
                          </div>
                          <div className="flex-1" data-id="element-1696">
                            <p className="font-bold text-sm text-trustopay-navy" data-id="element-1697">
                              Visa •••• 3456
                            </p>
                            <p className="text-[10px] text-gray-500" data-id="element-1698">
                              Expires 08/27
                            </p>
                          </div>
                          {useSavedCard && <Check size={18} className="text-trustopay-purple" data-id="element-1699" />}
                        </button>
                      </div>

                      {!useSavedCard && <motion.div initial={{
                opacity: 0,
                height: 0
              }} animate={{
                opacity: 1,
                height: 'auto'
              }} className="space-y-3 overflow-hidden" data-id="element-1700">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-1701">
                            New Card
                          </p>
                          <div className="relative" data-id="element-1702">
                            <Input label="Card Number" placeholder="1234 5678 9012 3456" value={formatCardNumber(cardNumber)} onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))} data-id="element-1703" />
                            {detectCardType(cardNumber) && <span className="absolute right-3 top-9 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded" data-id="element-1704">
                                {detectCardType(cardNumber)}
                              </span>}
                          </div>
                          <Input label="Name on Card" placeholder="FULL NAME" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} data-id="element-1705" />
                          <div className="flex gap-3" data-id="element-1706">
                            <div className="flex-1" data-id="element-1707">
                              <Input label="Expiry" placeholder="MM/YY" value={cardExpiry} onChange={e => {
                      let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                      if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                      setCardExpiry(val);
                    }} data-id="element-1708" />
                            </div>
                            <div className="flex-1 relative" data-id="element-1709">
                              <Input label="CVV" placeholder="•••" type={showCvv ? 'text' : 'password'} value={cardCvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} data-id="element-1710" />
                              <button onClick={() => setShowCvv(!showCvv)} className="absolute right-3 top-9 text-gray-400" data-id="element-1711">
                                {showCvv ? <EyeOff size={16} data-id="element-1712" /> : <Eye size={16} data-id="element-1713" />}
                              </button>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer" data-id="element-1714">
                            <button onClick={() => setSaveCard(!saveCard)} className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all', saveCard ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300')} data-id="element-1715">
                              {saveCard && <Check size={12} className="text-white" data-id="element-1716" />}
                            </button>
                            Save card for future payments
                          </label>
                        </motion.div>}

                      <button onClick={() => setUseSavedCard(false)} className="text-xs font-medium text-trustopay-purple" data-id="element-1717">
                        {useSavedCard ? '+ Use a different card' : ''}
                      </button>

                      {/* Fee Notice */}
                      <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-700 flex items-start gap-2" data-id="element-1718">
                        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" data-id="element-1719" />
                        <span data-id="element-1720">
                          A 2% processing fee ({formatINR(feeAmount)}) applies
                          for card payments.
                        </span>
                      </div>
                    </div>}

                  {/* ── Net Banking Detail ── */}
                  {selectedMethod === 'netbanking' && <div className="space-y-4" data-id="element-1721">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-1722">
                        Popular Banks
                      </p>
                      <div className="grid grid-cols-3 gap-2.5" data-id="element-1723">
                        {POPULAR_BANKS.map(bank => <button key={bank.id} onClick={() => setSelectedBank(bank.id)} className={cn('p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all', selectedBank === bank.id ? 'border-trustopay-purple bg-purple-50' : 'border-gray-100')} data-id="element-1724">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-bold', bank.color)} data-id="element-1725">
                              {bank.name.slice(0, 3)}
                            </div>
                            <p className="text-[11px] font-medium text-trustopay-navy" data-id="element-1726">
                              {bank.name}
                            </p>
                          </button>)}
                      </div>

                      <div className="relative" data-id="element-1727">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" data-id="element-1728" />
                        <input type="text" placeholder="Search other banks..." value={bankSearch} onChange={e => setBankSearch(e.target.value)} className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-1729" />
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex items-start gap-2" data-id="element-1730">
                        <Building2 size={14} className="mt-0.5 flex-shrink-0" data-id="element-1731" />
                        <span data-id="element-1732">
                          You'll be redirected to your bank's secure login page
                          to authorize payment.
                        </span>
                      </div>
                    </div>}

                  {/* ── PayPal Detail ── */}
                  {selectedMethod === 'paypal' && <div className="space-y-4" data-id="element-1733">
                      <div className="bg-[#003087] rounded-xl p-6 text-center" data-id="element-1734">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3" data-id="element-1735">
                          <span className="text-[#003087] font-black text-xl" data-id="element-1736">
                            PP
                          </span>
                        </div>
                        <p className="text-white font-bold text-lg" data-id="element-1737">PayPal</p>
                        <p className="text-blue-200 text-xs mt-1" data-id="element-1738">
                          International payments
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm" data-id="element-1739">
                        <div className="flex justify-between" data-id="element-1740">
                          <span className="text-gray-500" data-id="element-1741">Invoice Amount</span>
                          <span className="font-medium" data-id="element-1742">
                            {formatINR(amount)}
                          </span>
                        </div>
                        <div className="flex justify-between" data-id="element-1743">
                          <span className="text-gray-500" data-id="element-1744">PayPal Fee (3%)</span>
                          <span className="font-medium text-amber-600" data-id="element-1745">
                            +{formatINR(feeAmount)}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-trustopay-navy" data-id="element-1746">
                          <span data-id="element-1747">Total</span>
                          <span data-id="element-1748">{formatINR(totalAmount)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-center text-xs text-gray-500" data-id="element-1749">
                        <Shield size={12} data-id="element-1750" />
                        <span data-id="element-1751">Buyer & Seller Protection included</span>
                      </div>
                    </div>}

                  {/* Payment Summary (for methods with fees) */}
                  {selectedMethod === 'card' && <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mt-4" data-id="element-1752">
                      <div className="flex justify-between" data-id="element-1753">
                        <span className="text-gray-500" data-id="element-1754">Invoice Amount</span>
                        <span className="font-medium" data-id="element-1755">{formatINR(amount)}</span>
                      </div>
                      <div className="flex justify-between" data-id="element-1756">
                        <span className="text-gray-500" data-id="element-1757">
                          Processing Fee ({methodInfo.fee}%)
                        </span>
                        <span className="font-medium text-amber-600" data-id="element-1758">
                          +{formatINR(feeAmount)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-trustopay-navy" data-id="element-1759">
                        <span data-id="element-1760">Total</span>
                        <span data-id="element-1761">{formatINR(totalAmount)}</span>
                      </div>
                    </div>}

                  {/* Payment Note */}
                  <div className="mt-5" data-id="element-1762">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block" data-id="element-1763">
                      Note (Optional)
                    </label>
                    <input type="text" placeholder="Payment for monthly retainer..." value={paymentNote} onChange={e => setPaymentNote(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-1764" />
                  </div>

                  <div className="flex items-center gap-2 justify-center py-3 mt-2" data-id="element-1765">
                    <Lock size={11} className="text-gray-400" data-id="element-1766" />
                    <p className="text-[10px] text-gray-400" data-id="element-1767">
                      256-bit SSL encrypted • PCI DSS compliant
                    </p>
                  </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-white" data-id="element-1768">
                  <Button className="w-full h-13 text-base" onClick={handlePayFromDetail} disabled={selectedMethod === 'upi' && upiMode === 'app' && !selectedUpiApp || selectedMethod === 'upi' && upiMode === 'id' && !upiId.includes('@') || selectedMethod === 'netbanking' && !selectedBank || selectedMethod === 'card' && !useSavedCard && cardNumber.length < 15} data-id="element-1769">
                    {selectedMethod === 'netbanking' ? 'Continue to Bank Login' : selectedMethod === 'paypal' ? 'Continue to PayPal' : `Pay ${formatINR(totalAmount)} Securely`}
                  </Button>
                </div>
              </>}

            {/* ═══ STEP: PIN VERIFICATION ═══ */}
            {step === 'pin' && <div className="p-5 flex flex-col items-center justify-center flex-1" data-id="element-1770">
                <button onClick={() => setStep(selectedMethod === 'wallet' ? 'select' : 'detail')} className="self-start p-2 -ml-2 hover:bg-gray-100 rounded-full mb-6" data-id="element-1771">
                  <ArrowLeft size={22} className="text-trustopay-navy" data-id="element-1772" />
                </button>

                <div className="w-16 h-16 bg-trustopay-purple/10 rounded-full flex items-center justify-center mb-4" data-id="element-1773">
                  <Lock size={28} className="text-trustopay-purple" data-id="element-1774" />
                </div>
                <h2 className="text-xl font-bold text-trustopay-navy mb-1" data-id="element-1775">
                  Enter PIN
                </h2>
                <p className="text-sm text-gray-500 mb-8" data-id="element-1776">
                  Verify your identity to complete payment
                </p>

                {/* PIN Dots */}
                <div className="flex gap-4 mb-8" data-id="element-1777">
                  {[0, 1, 2, 3].map(i => <motion.div key={i} animate={{
              scale: pin.length > i ? 1.1 : 1
            }} className={cn('w-4 h-4 rounded-full transition-colors', pin.length > i ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1778" />)}
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-3 gap-3 w-64" data-id="element-1779">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((key, i) => <button key={i} onClick={() => {
              if (key === 'del') setPin(prev => prev.slice(0, -1));else if (key !== null && pin.length < 4) {
                const newPin = pin + key;
                setPin(newPin);
                if (newPin.length === 4) {
                  setTimeout(() => startProcessing(), 300);
                }
              }
            }} disabled={key === null} className={cn('h-14 rounded-xl text-xl font-bold transition-colors', key === null ? 'invisible' : key === 'del' ? 'text-gray-500 hover:bg-gray-100' : 'text-trustopay-navy hover:bg-gray-100 active:bg-gray-200')} data-id="element-1780">
                      {key === 'del' ? '⌫' : key}
                    </button>)}
                </div>

                <p className="text-[10px] text-gray-400 mt-6" data-id="element-1781">
                  Use fingerprint or Face ID if available
                </p>
              </div>}

            {/* ═══ STEP: PROCESSING ═══ */}
            {step === 'processing' && <div className="flex-1 flex flex-col items-center justify-center p-8" data-id="element-1782">
                {/* Animated spinner */}
                <div className="relative w-24 h-24 mb-6" data-id="element-1783">
                  <motion.div className="absolute inset-0 rounded-full border-4 border-gray-100" data-id="element-1784" />
                  <motion.div className="absolute inset-0 rounded-full border-4 border-trustopay-purple border-t-transparent" animate={{
              rotate: 360
            }} transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }} data-id="element-1785" />
                  <div className="absolute inset-0 flex items-center justify-center" data-id="element-1786">
                    <Zap size={28} className="text-trustopay-purple" data-id="element-1787" />
                  </div>
                </div>

                <h2 className="text-xl font-bold text-trustopay-navy mb-2" data-id="element-1788">
                  Processing Payment
                </h2>
                <p className="text-sm text-gray-500 mb-6" data-id="element-1789">
                  Please don't close this screen
                </p>

                {/* Progress bar */}
                <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden" data-id="element-1790">
                  <motion.div className="h-full bg-trustopay-purple rounded-full" animate={{
              width: `${Math.min(processingProgress, 100)}%`
            }} transition={{
              duration: 0.3
            }} data-id="element-1791" />
                </div>

                <p className="text-[10px] text-gray-400 mt-8 flex items-center gap-1" data-id="element-1792">
                  <Lock size={10} data-id="element-1793" /> Secure payment in progress
                </p>
              </div>}

            {/* ═══ STEP: SUCCESS ═══ */}
            {step === 'success' && <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden" data-id="element-1794">
                {/* Confetti */}
                {showConfetti && <div className="absolute inset-0 pointer-events-none overflow-hidden" data-id="element-1795">
                    {Array.from({
              length: 30
            }).map((_, i) => <motion.div key={i} initial={{
              x: '50%',
              y: '-10%',
              rotate: 0,
              opacity: 1
            }} animate={{
              x: `${Math.random() * 100}%`,
              y: '110%',
              rotate: Math.random() * 720 - 360,
              opacity: 0
            }} transition={{
              duration: 2 + Math.random(),
              delay: Math.random() * 0.5,
              ease: 'easeOut'
            }} className="absolute w-2 h-2 rounded-sm" style={{
              backgroundColor: ['#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 6]
            }} data-id="element-1796" />)}
                  </div>}

                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            type: 'spring',
            damping: 12,
            stiffness: 200
          }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5" data-id="element-1797">
                  <CheckCircle2 size={44} className="text-green-600" data-id="element-1798" />
                </motion.div>

                <motion.h2 initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="text-2xl font-bold text-trustopay-navy mb-1" data-id="element-1799">
                  Payment Successful!
                </motion.h2>

                <motion.p initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.3
          }} className="text-gray-500 mb-6" data-id="element-1800">
                  {formatINR(totalAmount)} paid to {sellerName}
                </motion.p>

                <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} className="bg-gray-50 rounded-xl p-4 w-full max-w-xs space-y-2.5 text-sm mb-6" data-id="element-1801">
                  <div className="flex justify-between" data-id="element-1802">
                    <span className="text-gray-500" data-id="element-1803">Invoice</span>
                    <span className="font-medium text-trustopay-navy" data-id="element-1804">
                      #{invoiceId}
                    </span>
                  </div>
                  <div className="flex justify-between" data-id="element-1805">
                    <span className="text-gray-500" data-id="element-1806">Method</span>
                    <span className="font-medium text-trustopay-navy" data-id="element-1807">
                      {methodInfo.name}
                    </span>
                  </div>
                  <div className="flex justify-between" data-id="element-1808">
                    <span className="text-gray-500" data-id="element-1809">Transaction ID</span>
                    <span className="font-mono text-[11px] text-trustopay-navy" data-id="element-1810">
                      {txnId}
                    </span>
                  </div>
                  <div className="flex justify-between" data-id="element-1811">
                    <span className="text-gray-500" data-id="element-1812">Date</span>
                    <span className="font-medium text-trustopay-navy" data-id="element-1813">
                      {new Date().toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
                    </span>
                  </div>
                </motion.div>

                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.5
          }} className="flex gap-3 w-full max-w-xs" data-id="element-1814">
                  <Button variant="outline" className="flex-1 text-xs" onClick={() => {}} data-id="element-1815">
                    Download Receipt
                  </Button>
                  <Button variant="outline" className="flex-1 text-xs" onClick={() => {}} data-id="element-1816">
                    View Invoice
                  </Button>
                </motion.div>

                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.6
          }} className="mt-6 w-full max-w-xs" data-id="element-1817">
                  <Button className="w-full" onClick={onClose} data-id="element-1818">
                    Done
                  </Button>
                </motion.div>
              </div>}

            {/* ═══ STEP: FAILURE ═══ */}
            {step === 'failure' && <div className="flex-1 flex flex-col items-center justify-center p-8" data-id="element-1819">
                <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5" data-id="element-1820">
                  <XCircle size={44} className="text-red-500" data-id="element-1821" />
                </motion.div>

                <h2 className="text-2xl font-bold text-trustopay-navy mb-2" data-id="element-1822">
                  Payment Failed
                </h2>
                <p className="text-sm text-gray-500 mb-2" data-id="element-1823">
                  We couldn't process your payment.
                </p>

                <div className="bg-red-50 rounded-xl p-4 w-full max-w-xs mb-6" data-id="element-1824">
                  <p className="text-sm font-medium text-red-700 mb-2" data-id="element-1825">
                    Reason:
                  </p>
                  <p className="text-sm text-red-600" data-id="element-1826">
                    {failureReason || 'Transaction declined by bank'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 w-full max-w-xs mb-6" data-id="element-1827">
                  <p className="text-xs font-bold text-gray-500 mb-2" data-id="element-1828">
                    What you can do:
                  </p>
                  <ul className="space-y-1.5 text-xs text-gray-600" data-id="element-1829">
                    <li data-id="element-1830">• Try a different payment method</li>
                    <li data-id="element-1831">• Check your bank balance</li>
                    <li data-id="element-1832">• Contact your bank for details</li>
                  </ul>
                </div>

                <div className="flex gap-3 w-full max-w-xs" data-id="element-1833">
                  <Button variant="outline" className="flex-1" onClick={handleRetry} data-id="element-1834">
                    Try Again
                  </Button>
                  <Button className="flex-1" onClick={() => {
              setStep('select');
            }} data-id="element-1835">
                    Change Method
                  </Button>
                </div>

                <button onClick={onClose} className="mt-4 text-xs text-gray-400 hover:text-gray-600" data-id="element-1836">
                  Contact Support
                </button>
              </div>}
          </motion.div>
        </>}
    </AnimatePresence>;
}