import React, { useEffect, useState, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle, Loader2, ShieldCheck, Smartphone, Mail, CreditCard, Building, Landmark, Clock, X, Upload, Camera, Eye, EyeOff, ChevronRight, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn } from '../lib/utils';
interface VerificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}
type VerificationStatus = 'verified' | 'pending' | 'not_added' | 'failed';
interface VerificationState {
  mobile: VerificationStatus;
  email: VerificationStatus;
  pan: VerificationStatus;
  gstin: VerificationStatus;
  bank: VerificationStatus;
}
export function VerificationCenter({
  isOpen,
  onClose
}: VerificationCenterProps) {
  // Initial Mock State
  const [verifications, setVerifications] = useState<VerificationState>({
    mobile: 'verified',
    email: 'verified',
    pan: 'pending',
    gstin: 'not_added',
    bank: 'verified'
  });
  const [activeFlow, setActiveFlow] = useState<'pan' | 'gstin' | 'bank' | null>(null);
  const [flowStep, setFlowStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showBenefits, setShowBenefits] = useState(false);
  // Form Data
  const [panData, setPanData] = useState({
    number: '',
    name: 'Ankit Shah',
    image: null as string | null
  });
  const [gstinData, setGstinData] = useState({
    number: ''
  });
  const [bankData, setBankData] = useState({
    holder: 'Ankit Shah',
    account: '',
    confirmAccount: '',
    ifsc: ''
  });
  const [showAccount, setShowAccount] = useState(false);
  // Calculate Progress
  const totalSteps = 5;
  const completedSteps = Object.values(verifications).filter(v => v === 'verified').length;
  const progressPercentage = completedSteps / totalSteps * 100;
  const showSuccessToast = (message: string) => {
    setShowToast({
      type: 'success',
      message
    });
    setTimeout(() => setShowToast(null), 3000);
  };
  const showErrorToast = (message: string) => {
    setShowToast({
      type: 'error',
      message
    });
    setTimeout(() => setShowToast(null), 3000);
  };
  // PAN Verification Logic
  const handlePanSubmit = () => {
    if (panData.number.length !== 10) {
      showErrorToast('Invalid PAN format');
      return;
    }
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications(prev => ({
        ...prev,
        pan: 'verified'
      }));
      showSuccessToast('PAN Verified Successfully! ✓');
      setActiveFlow(null);
      setFlowStep(1);
    }, 2000);
  };
  // GSTIN Verification Logic
  const handleGstinSubmit = () => {
    if (gstinData.number.length !== 15) {
      showErrorToast('Invalid GSTIN format');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications(prev => ({
        ...prev,
        gstin: 'verified'
      }));
      showSuccessToast('GSTIN Verified Successfully! ✓');
      setActiveFlow(null);
      setFlowStep(1);
    }, 2000);
  };
  // Bank Verification Logic
  const handleBankSubmit = () => {
    if (bankData.account !== bankData.confirmAccount) {
      showErrorToast('Account numbers do not match');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications(prev => ({
        ...prev,
        bank: 'verified'
      }));
      showSuccessToast('Account Verified Successfully! ✓');
      setActiveFlow(null);
      setFlowStep(1);
    }, 2000);
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-3588">
      {/* Toast */}
      <AnimatePresence data-id="element-3589">
        {showToast && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', showToast.type === 'success' ? 'bg-green-600' : showToast.type === 'error' ? 'bg-red-600' : 'bg-blue-600')} data-id="element-3590">
            {showToast.type === 'success' ? <Check size={16} data-id="element-3591" /> : showToast.type === 'error' ? <AlertCircle size={16} data-id="element-3592" /> : <Info size={16} data-id="element-3593" />}
            {showToast.message}
          </motion.div>}
      </AnimatePresence>

      {/* Main Dashboard View */}
      <div className="flex flex-col h-full" data-id="element-3594">
        {/* Header */}
        <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between" data-id="element-3595">
          <div className="flex items-center gap-3" data-id="element-3596">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-3597">
              <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3598" />
            </button>
            <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3599">
              Verification Center
            </h2>
          </div>
          <button onClick={() => setShowBenefits(true)} className="text-xs font-medium text-trustopay-purple hover:underline" data-id="element-3600">
            Why Verify?
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-24" data-id="element-3601">
          {/* Progress Card */}
          <Card className="p-4 bg-purple-50 border-purple-100" data-id="element-3602">
            <div className="flex justify-between items-end mb-2" data-id="element-3603">
              <h3 className="font-bold text-trustopay-navy text-sm" data-id="element-3604">
                Your Verification Status
              </h3>
              <span className="text-2xl font-bold text-trustopay-purple" data-id="element-3605">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-purple-200 rounded-full overflow-hidden mb-3" data-id="element-3606">
              <motion.div initial={{
              width: 0
            }} animate={{
              width: `${progressPercentage}%`
            }} className="h-full bg-trustopay-purple rounded-full" data-id="element-3607" />
            </div>
            <p className="text-xs text-gray-600 mb-1" data-id="element-3608">
              {completedSteps} of {totalSteps} verifications complete
            </p>
            <p className="text-xs font-medium text-trustopay-purple" data-id="element-3609">
              Complete all to unlock premium features!
            </p>
          </Card>

          {/* Verification Cards List */}
          <div className="space-y-3" data-id="element-3610">
            {/* Mobile */}
            <VerificationCard icon={Smartphone} title="Mobile Number" status={verifications.mobile} value="+91 98765 43210" date="Feb 5, 2026" data-id="element-3611" />

            {/* Email */}
            <VerificationCard icon={Mail} title="Email Address" status={verifications.email} value="ankit@trustopay.com" date="Feb 5, 2026" data-id="element-3612" />

            {/* PAN */}
            <VerificationCard icon={CreditCard} title="PAN Card" status={verifications.pan} description="Verify your identity for secure transactions" actionLabel="Upload PAN Card" onAction={() => {
            setActiveFlow('pan');
            setFlowStep(1);
          }} data-id="element-3613" />

            {/* GSTIN */}
            <VerificationCard icon={Building} title="GSTIN" status={verifications.gstin} description="For GST-registered businesses (Optional)" actionLabel="Add GSTIN" onAction={() => {
            setActiveFlow('gstin');
            setFlowStep(1);
          }} data-id="element-3614" />

            {/* Bank */}
            <VerificationCard icon={Landmark} title="Bank Account" status={verifications.bank} value="XXXX XXXX XXXX 1234" subValue="State Bank of India" date="Feb 8, 2026" actionLabel={verifications.bank !== 'verified' ? 'Verify Bank Account' : undefined} onAction={() => {
            setActiveFlow('bank');
            setFlowStep(1);
          }} data-id="element-3615" />
          </div>
        </div>
      </div>

      {/* PAN Verification Flow Overlay */}
      <AnimatePresence data-id="element-3616">
        {activeFlow === 'pan' && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} className="fixed inset-0 z-50 bg-white flex flex-col" data-id="element-3617">
            <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3" data-id="element-3618">
              <button onClick={() => setActiveFlow(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3619">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3620" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3621">
                PAN Verification
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-3622">
              <div className="space-y-4" data-id="element-3623">
                <Input label="Enter PAN Number *" placeholder="ABCDE1234F" value={panData.number} onChange={e => setPanData({
              ...panData,
              number: e.target.value.toUpperCase()
            })} maxLength={10} data-id="element-3624" />
                <p className="text-xs text-gray-500 -mt-2" data-id="element-3625">
                  Format: AAAAA9999A
                </p>

                <Input label="Name on PAN Card *" value={panData.name} onChange={e => setPanData({
              ...panData,
              name: e.target.value
            })} data-id="element-3626" />
                <p className="text-xs text-gray-500 -mt-2" data-id="element-3627">
                  Must match your registered name
                </p>

                <div data-id="element-3628">
                  <label className="block text-sm font-medium text-gray-700 mb-2" data-id="element-3629">
                    Upload PAN Card Image *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" data-id="element-3630">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3" data-id="element-3631">
                      <Upload size={20} className="text-trustopay-purple" data-id="element-3632" />
                    </div>
                    <p className="text-sm font-medium text-trustopay-navy" data-id="element-3633">
                      Upload Front Side
                    </p>
                    <p className="text-xs text-gray-400 mt-1" data-id="element-3634">
                      Max 5MB • JPG, PNG, PDF
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl" data-id="element-3635">
                  <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider" data-id="element-3636">
                    Verification Method
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer" data-id="element-3637">
                    <div className="mt-0.5" data-id="element-3638">
                      <input type="radio" checked readOnly className="text-trustopay-purple" data-id="element-3639" />
                    </div>
                    <div data-id="element-3640">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-3641">
                        Instant Verification
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-3642">
                        Verify in minutes via government API
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100" data-id="element-3643">
              <Button className="w-full" onClick={handlePanSubmit} disabled={isSubmitting || !panData.number || !panData.name} data-id="element-3644">
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-3645" />{' '}
                    Verifying...
                  </> : 'Submit for Verification'}
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* GSTIN Verification Flow Overlay */}
      <AnimatePresence data-id="element-3646">
        {activeFlow === 'gstin' && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} className="fixed inset-0 z-50 bg-white flex flex-col" data-id="element-3647">
            <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3" data-id="element-3648">
              <button onClick={() => setActiveFlow(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3649">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3650" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3651">
                GSTIN Verification
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-3652">
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start" data-id="element-3653">
                <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" data-id="element-3654" />
                <div data-id="element-3655">
                  <p className="text-sm font-bold text-blue-700" data-id="element-3656">
                    GSTIN is optional
                  </p>
                  <p className="text-xs text-blue-600 mt-1" data-id="element-3657">
                    Only required if you are GST registered. Skip this if you're
                    not registered.
                  </p>
                </div>
              </div>

              <div className="space-y-4" data-id="element-3658">
                <Input label="GSTIN Number *" placeholder="24ABCDE1234F1Z5" value={gstinData.number} onChange={e => setGstinData({
              ...gstinData,
              number: e.target.value.toUpperCase()
            })} maxLength={15} data-id="element-3659" />
                <p className="text-xs text-gray-500 -mt-2" data-id="element-3660">
                  Format: 15 characters
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex gap-3" data-id="element-3661">
              <Button variant="outline" className="flex-1" onClick={() => setActiveFlow(null)} data-id="element-3662">
                Skip
              </Button>
              <Button className="flex-[2]" onClick={handleGstinSubmit} disabled={isSubmitting || !gstinData.number} data-id="element-3663">
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-3664" />{' '}
                    Verifying...
                  </> : 'Verify GSTIN'}
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Bank Verification Flow Overlay */}
      <AnimatePresence data-id="element-3665">
        {activeFlow === 'bank' && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} className="fixed inset-0 z-50 bg-white flex flex-col" data-id="element-3666">
            <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center gap-3" data-id="element-3667">
              <button onClick={() => setActiveFlow(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3668">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3669" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-3670">
                Bank Verification
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-3671">
              <Card className="p-4 bg-green-50 border-green-100" data-id="element-3672">
                <h3 className="text-sm font-bold text-green-800 mb-2" data-id="element-3673">
                  Why verify your bank account?
                </h3>
                <ul className="space-y-1" data-id="element-3674">
                  {['Receive payments directly', 'Enable invoice financing', 'Faster withdrawals', 'Show on invoices'].map((item, i) => <li key={i} className="text-xs text-green-700 flex items-center gap-2" data-id="element-3675">
                      <Check size={12} data-id="element-3676" /> {item}
                    </li>)}
                </ul>
              </Card>

              <div className="space-y-4" data-id="element-3677">
                <Input label="Account Holder Name *" value={bankData.holder} onChange={e => setBankData({
              ...bankData,
              holder: e.target.value
            })} data-id="element-3678" />

                <div className="relative" data-id="element-3679">
                  <Input label="Account Number *" type={showAccount ? 'text' : 'password'} value={bankData.account} onChange={e => setBankData({
                ...bankData,
                account: e.target.value.replace(/\D/g, '')
              })} data-id="element-3680" />
                  <button className="absolute right-3 top-[34px] text-gray-400" onClick={() => setShowAccount(!showAccount)} data-id="element-3681">
                    {showAccount ? <EyeOff size={18} data-id="element-3682" /> : <Eye size={18} data-id="element-3683" />}
                  </button>
                </div>

                <Input label="Confirm Account Number *" type="text" // Always show confirm
            value={bankData.confirmAccount} onChange={e => setBankData({
              ...bankData,
              confirmAccount: e.target.value.replace(/\D/g, '')
            })} data-id="element-3684" />

                <Input label="IFSC Code *" placeholder="SBIN0001234" value={bankData.ifsc} onChange={e => setBankData({
              ...bankData,
              ifsc: e.target.value.toUpperCase()
            })} maxLength={11} data-id="element-3685" />

                <div className="bg-blue-50 p-4 rounded-xl mt-4" data-id="element-3686">
                  <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wider" data-id="element-3687">
                    Verification Method
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer" data-id="element-3688">
                    <div className="mt-0.5" data-id="element-3689">
                      <input type="radio" checked readOnly className="text-trustopay-purple" data-id="element-3690" />
                    </div>
                    <div data-id="element-3691">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-3692">
                        Penny Drop (Instant)
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-3693">
                        We'll deposit ₹1 and verify instantly
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100" data-id="element-3694">
              <Button className="w-full" onClick={handleBankSubmit} disabled={isSubmitting || !bankData.account || !bankData.ifsc} data-id="element-3695">
                {isSubmitting ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-3696" />{' '}
                    Verifying...
                  </> : 'Verify Account'}
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Benefits Modal */}
      <AnimatePresence data-id="element-3697">
        {showBenefits && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBenefits(false)} data-id="element-3698">
            <motion.div initial={{
          scale: 0.95
        }} animate={{
          scale: 1
        }} exit={{
          scale: 0.95
        }} className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()} data-id="element-3699">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center" data-id="element-3700">
                <h3 className="font-bold text-lg text-trustopay-navy" data-id="element-3701">
                  Benefits of Verification
                </h3>
                <button onClick={() => setShowBenefits(false)} className="p-1 hover:bg-gray-100 rounded-full" data-id="element-3702">
                  <X size={20} data-id="element-3703" />
                </button>
              </div>
              <div className="p-5 space-y-4" data-id="element-3704">
                {[{
              icon: '🎯',
              title: 'Invoice Financing',
              desc: 'Get paid instantly for pending invoices'
            }, {
              icon: '💰',
              title: 'Higher Limits',
              desc: 'Process unlimited invoice amounts'
            }, {
              icon: '⚡',
              title: 'Priority Support',
              desc: 'Faster response times for queries'
            }, {
              icon: '🏆',
              title: 'Verified Badge',
              desc: 'Build trust with your clients'
            }, {
              icon: '🔒',
              title: 'Enhanced Security',
              desc: 'Additional fraud protection'
            }].map((item, i) => <div key={i} className="flex gap-3" data-id="element-3705">
                    <span className="text-xl" data-id="element-3706">{item.icon}</span>
                    <div data-id="element-3707">
                      <p className="font-bold text-sm text-trustopay-navy" data-id="element-3708">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-3709">{item.desc}</p>
                    </div>
                  </div>)}
              </div>
              <div className="p-5 border-t border-gray-100" data-id="element-3710">
                <Button className="w-full" onClick={() => setShowBenefits(false)} data-id="element-3711">
                  Start Verification
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}
// Helper Component for Cards
function VerificationCard({
  icon: Icon,
  title,
  status,
  value,
  subValue,
  date,
  description,
  actionLabel,
  onAction
}: {
  icon: any;
  title: string;
  status: VerificationStatus;
  value?: string;
  subValue?: string;
  date?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const statusConfig = {
    verified: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: Check,
      label: 'Verified'
    },
    pending: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    not_added: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: X,
      label: 'Not Added'
    },
    failed: {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      label: 'Failed'
    }
  };
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  return <Card className={cn('p-4 border', config.border, status === 'verified' ? 'bg-white' : config.bg)} data-id="element-3712">
      <div className="flex justify-between items-start mb-3" data-id="element-3713">
        <div className="flex items-center gap-2" data-id="element-3714">
          <Icon size={18} className="text-gray-500" data-id="element-3715" />
          <span className="font-bold text-sm text-trustopay-navy" data-id="element-3716">{title}</span>
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full', config.bg, config.color)} data-id="element-3717">
          <StatusIcon size={12} data-id="element-3718" />
          {config.label}
        </div>
      </div>

      <div className="pl-6 space-y-1" data-id="element-3719">
        {value && <p className="font-medium text-sm text-trustopay-navy" data-id="element-3720">{value}</p>}
        {subValue && <p className="text-xs text-gray-500" data-id="element-3721">{subValue}</p>}
        {description && <p className="text-xs text-gray-500 leading-relaxed" data-id="element-3722">{description}</p>}
        {date && <p className="text-[10px] text-gray-400 mt-1" data-id="element-3723">Verified on: {date}</p>}

        {actionLabel && <Button size="sm" variant="outline" className="mt-3 w-full border-trustopay-purple text-trustopay-purple hover:bg-purple-50" onClick={onAction} data-id="element-3724">
            {actionLabel}
          </Button>}
      </div>
    </Card>;
}