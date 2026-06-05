import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, Edit2, Bell, MessageCircle, Mail, Calendar, FileText, ChevronDown, Banknote, Layers, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { CustomersPage } from '../pages/CustomersPage';
import { formatINR, cn } from '../lib/utils';
interface SendInvoiceFlowProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCustomer?: any;
}
interface Milestone {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
}
export function SendInvoiceFlow({
  isOpen,
  onClose,
  preselectedCustomer
}: SendInvoiceFlowProps) {
  const [step, setStep] = useState(preselectedCustomer ? 2 : 1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(preselectedCustomer || null);
  // Invoice Details
  const [invoiceNumber, setInvoiceNumber] = useState('INV-008');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [includeGST, setIncludeGST] = useState(true);
  const [items, setItems] = useState([{
    id: 1,
    name: '',
    qty: 1,
    rate: 0
  }]);
  // Payment Structure
  const [paymentType, setPaymentType] = useState<'full' | 'milestone' | 'recurring'>('full');
  const [milestones, setMilestones] = useState<Milestone[]>([{
    id: 1,
    name: 'Milestone 1',
    amount: 0,
    dueDate: ''
  }, {
    id: 2,
    name: 'Milestone 2',
    amount: 0,
    dueDate: ''
  }]);
  // Saved Items
  const [showSavedItems, setShowSavedItems] = useState(false);
  const savedItems = [{
    id: 1,
    name: 'Website Design',
    rate: 15000
  }, {
    id: 2,
    name: 'Logo Design',
    rate: 5000
  }, {
    id: 3,
    name: 'Consulting',
    rate: 8000
  }];
  // Delivery channels
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  // Reminders
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderWhatsApp, setReminderWhatsApp] = useState(false);
  const [reminderEmail, setReminderEmail] = useState(false);
  // Recurring Settings
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endCondition, setEndCondition] = useState('never');
  const [endAfterCount, setEndAfterCount] = useState('12');
  const [endDate, setEndDate] = useState('');
  const [autoSend, setAutoSend] = useState(true);
  const [reminderDays, setReminderDays] = useState('3');
  const [recurringName, setRecurringName] = useState('');
  const [weeklyDays, setWeeklyDays] = useState<string[]>(['mon']);
  const [monthlyDay, setMonthlyDay] = useState('1');
  const [monthlyOption, setMonthlyOption] = useState<'day' | 'last'>('day');
  const [notifyBeforeSend, setNotifyBeforeSend] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState('30');
  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      name: '',
      qty: 1,
      rate: 0
    }]);
  };
  const addSavedItem = (savedItem: any) => {
    setItems([...items, {
      id: Date.now(),
      name: savedItem.name,
      qty: 1,
      rate: savedItem.rate
    }]);
    setShowSavedItems(false);
  };
  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };
  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? {
      ...i,
      [field]: value
    } : i));
  };
  // Milestone helpers
  const addMilestone = () => {
    setMilestones([...milestones, {
      id: Date.now(),
      name: `Milestone ${milestones.length + 1}`,
      amount: 0,
      dueDate: ''
    }]);
  };
  const removeMilestone = (id: number) => {
    if (milestones.length > 2) {
      setMilestones(milestones.filter(m => m.id !== id));
    }
  };
  const updateMilestone = (id: number, field: string, value: any) => {
    setMilestones(milestones.map(m => m.id === id ? {
      ...m,
      [field]: value
    } : m));
  };
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const tax = includeGST ? subtotal * 0.18 : 0;
  const total = subtotal + tax;
  const milestoneAllocated = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const milestoneRemaining = total - milestoneAllocated;
  const milestonesValid = Math.abs(milestoneRemaining) < 1 && total > 0;
  const splitEqually = () => {
    if (milestones.length === 0 || total === 0) return;
    const perMilestone = Math.floor(total / milestones.length);
    const remainder = total - perMilestone * milestones.length;
    setMilestones(milestones.map((m, i) => ({
      ...m,
      amount: i === 0 ? perMilestone + remainder : perMilestone
    })));
  };
  const handleNext = () => {
    if (step < 3) setStep(step + 1);else onClose();
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);else onClose();
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-white z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-3078">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between bg-white" data-id="element-3079">
        <button onClick={handleBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-3080">
          <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-3081" />
        </button>
        <div className="flex gap-2" data-id="element-3082">
          {[1, 2, 3].map(s => <div key={s} className={`w-2 h-2 rounded-full transition-colors ${s === step ? 'bg-trustopay-purple' : s < step ? 'bg-trustopay-purple/40' : 'bg-gray-200'}`} data-id="element-3083" />)}
        </div>
        <div className="w-10" data-id="element-3084" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50" data-id="element-3085">
        <AnimatePresence mode="wait" data-id="element-3086">
          {step === 1 && <motion.div key="step1" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="h-full" data-id="element-3087">
              <CustomersPage mode="select" onSelectCustomer={c => {
            setSelectedCustomer(c);
            setStep(2);
          }} data-id="element-3088" />
            </motion.div>}

          {step === 2 && <motion.div key="step2" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="p-5 space-y-5 pb-28" data-id="element-3089">
              <div data-id="element-3090">
                <h2 className="text-xl font-bold text-trustopay-navy mb-1" data-id="element-3091">
                  Create Invoice
                </h2>
                <p className="text-sm text-gray-500" data-id="element-3092">
                  For {selectedCustomer?.name}
                </p>
              </div>

              {/* 1. Payment Structure — TOP */}
              <div className="space-y-3" data-id="element-3093">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3094">
                  Payment Type
                </p>
                <div className="grid grid-cols-3 gap-2" data-id="element-3095">
                  <button onClick={() => setPaymentType('full')} className={cn('p-3 rounded-xl border-2 text-left transition-all', paymentType === 'full' ? 'border-trustopay-purple bg-purple-50' : 'border-gray-200 bg-white')} data-id="element-3096">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', paymentType === 'full' ? 'bg-trustopay-purple' : 'bg-gray-100')} data-id="element-3097">
                      <Banknote size={18} className={paymentType === 'full' ? 'text-white' : 'text-gray-500'} data-id="element-3098" />
                    </div>
                    <p className={cn('font-bold text-xs leading-tight', paymentType === 'full' ? 'text-trustopay-purple' : 'text-trustopay-navy')} data-id="element-3099">
                      Full Payment
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5" data-id="element-3100">One-time</p>
                  </button>

                  <button onClick={() => setPaymentType('milestone')} className={cn('p-3 rounded-xl border-2 text-left transition-all', paymentType === 'milestone' ? 'border-trustopay-purple bg-purple-50' : 'border-gray-200 bg-white')} data-id="element-3101">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', paymentType === 'milestone' ? 'bg-trustopay-purple' : 'bg-gray-100')} data-id="element-3102">
                      <Layers size={18} className={paymentType === 'milestone' ? 'text-white' : 'text-gray-500'} data-id="element-3103" />
                    </div>
                    <p className={cn('font-bold text-xs leading-tight', paymentType === 'milestone' ? 'text-trustopay-purple' : 'text-trustopay-navy')} data-id="element-3104">
                      Milestones
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5" data-id="element-3105">Split pay</p>
                  </button>

                  <button onClick={() => setPaymentType('recurring')} className={cn('p-3 rounded-xl border-2 text-left transition-all', paymentType === 'recurring' ? 'border-trustopay-purple bg-purple-50' : 'border-gray-200 bg-white')} data-id="element-3106">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-2', paymentType === 'recurring' ? 'bg-trustopay-purple' : 'bg-gray-100')} data-id="element-3107">
                      <RefreshCw size={18} className={paymentType === 'recurring' ? 'text-white' : 'text-gray-500'} data-id="element-3108" />
                    </div>
                    <p className={cn('font-bold text-xs leading-tight', paymentType === 'recurring' ? 'text-trustopay-purple' : 'text-trustopay-navy')} data-id="element-3109">
                      Recurring
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5" data-id="element-3110">
                      Auto-repeat
                    </p>
                  </button>
                </div>
              </div>

              {/* 2. Invoice Meta — Number + Due Date (full only) */}
              <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-3111">
                <div className={cn('flex gap-4', paymentType !== 'full' && 'flex-col')} data-id="element-3112">
                  <div className={paymentType === 'full' ? 'flex-1' : 'w-full'} data-id="element-3113">
                    <Input label="Invoice No" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} data-id="element-3114" />
                  </div>
                  {paymentType === 'full' && <div className="flex-1" data-id="element-3115">
                      <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} data-id="element-3116" />
                    </div>}
                </div>
              </div>

              {/* 3. Recurring Settings (only if recurring) */}
              <AnimatePresence data-id="element-3117">
                {paymentType === 'recurring' && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} className="space-y-4 overflow-hidden" data-id="element-3118">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3119">
                      Recurring Settings
                    </p>

                    {/* Recurring Name */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-3120">
                      <Input label="Recurring Invoice Name" placeholder="e.g. Monthly Retainer - Tech Solutions" value={recurringName} onChange={e => setRecurringName(e.target.value)} data-id="element-3121" />
                      <p className="text-[10px] text-gray-400 mt-1" data-id="element-3122">
                        Helps identify in your recurring list
                      </p>
                    </div>

                    {/* Frequency + Schedule */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4" data-id="element-3123">
                      <div data-id="element-3124">
                        <label className="mb-1.5 block text-sm font-medium text-gray-700" data-id="element-3125">
                          Frequency
                        </label>
                        <select value={frequency} onChange={e => setFrequency(e.target.value)} className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustopay-purple" data-id="element-3126">
                          <option value="daily" data-id="element-3127">Daily</option>
                          <option value="weekly" data-id="element-3128">Weekly</option>
                          <option value="monthly" data-id="element-3129">Monthly</option>
                          <option value="quarterly" data-id="element-3130">Quarterly</option>
                          <option value="yearly" data-id="element-3131">Yearly</option>
                        </select>
                      </div>

                      {/* Weekly: Day Selection */}
                      {frequency === 'weekly' && <div data-id="element-3132">
                          <label className="mb-2 block text-sm font-medium text-gray-700" data-id="element-3133">
                            On days
                          </label>
                          <div className="flex gap-1.5" data-id="element-3134">
                            {[{
                      key: 'mon',
                      label: 'M'
                    }, {
                      key: 'tue',
                      label: 'T'
                    }, {
                      key: 'wed',
                      label: 'W'
                    }, {
                      key: 'thu',
                      label: 'T'
                    }, {
                      key: 'fri',
                      label: 'F'
                    }, {
                      key: 'sat',
                      label: 'S'
                    }, {
                      key: 'sun',
                      label: 'S'
                    }].map(day => <button key={day.key} onClick={() => {
                      setWeeklyDays(prev => prev.includes(day.key) ? prev.filter(d => d !== day.key) : [...prev, day.key]);
                    }} className={cn('w-10 h-10 rounded-lg text-sm font-bold transition-all', weeklyDays.includes(day.key) ? 'bg-trustopay-purple text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')} data-id="element-3135">
                                {day.label}
                              </button>)}
                          </div>
                        </div>}

                      {/* Monthly: Day of Month */}
                      {frequency === 'monthly' && <div data-id="element-3136">
                          <label className="mb-2 block text-sm font-medium text-gray-700" data-id="element-3137">
                            Generate on
                          </label>
                          <div className="space-y-2.5" data-id="element-3138">
                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3139">
                              <input type="radio" name="monthlyOpt" checked={monthlyOption === 'day'} onChange={() => setMonthlyOption('day')} className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3140" />
                              <span data-id="element-3141">Day</span>
                              <select value={monthlyDay} onChange={e => setMonthlyDay(e.target.value)} className="h-9 rounded-lg border border-gray-300 px-2 text-sm focus:ring-2 focus:ring-trustopay-purple" data-id="element-3142">
                                {Array.from({
                          length: 28
                        }, (_, i) => <option key={i + 1} value={String(i + 1)} data-id="element-3143">
                                      {i + 1}
                                    </option>)}
                              </select>
                              <span data-id="element-3144">of each month</span>
                            </label>
                            <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3145">
                              <input type="radio" name="monthlyOpt" checked={monthlyOption === 'last'} onChange={() => setMonthlyOption('last')} className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3146" />
                              Last day of month
                            </label>
                          </div>
                        </div>}

                      {/* Daily: Weekday option */}
                      {frequency === 'daily' && <div className="space-y-2" data-id="element-3147">
                          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3148">
                            <input type="radio" name="dailyOpt" defaultChecked className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3149" />
                            Every day
                          </label>
                          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3150">
                            <input type="radio" name="dailyOpt" className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3151" />
                            Every weekday (Mon–Fri)
                          </label>
                        </div>}

                      <Input label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} data-id="element-3152" />

                      <div data-id="element-3153">
                        <label className="mb-2 block text-sm font-medium text-gray-700" data-id="element-3154">
                          Ends
                        </label>
                        <div className="space-y-2.5" data-id="element-3155">
                          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3156">
                            <input type="radio" name="endCondition" checked={endCondition === 'never'} onChange={() => setEndCondition('never')} className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3157" />
                            Never (Until cancelled)
                          </label>
                          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3158">
                            <input type="radio" name="endCondition" checked={endCondition === 'count'} onChange={() => setEndCondition('count')} className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3159" />
                            After specific invoices
                          </label>
                          {endCondition === 'count' && <div className="pl-7" data-id="element-3160">
                              <Input type="number" placeholder="e.g. 12" value={endAfterCount} onChange={e => setEndAfterCount(e.target.value)} className="h-10" data-id="element-3161" />
                            </div>}
                          <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer" data-id="element-3162">
                            <input type="radio" name="endCondition" checked={endCondition === 'date'} onChange={() => setEndCondition('date')} className="text-trustopay-purple focus:ring-trustopay-purple" data-id="element-3163" />
                            On specific date
                          </label>
                          {endCondition === 'date' && <div className="pl-7" data-id="element-3164">
                              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-10" data-id="element-3165" />
                            </div>}
                        </div>
                      </div>
                    </div>

                    {/* Payment Terms */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-3166">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700" data-id="element-3167">
                        Payment Due
                      </label>
                      <div className="flex flex-wrap gap-2" data-id="element-3168">
                        {[{
                    value: '0',
                    label: 'Upon receipt'
                  }, {
                    value: '15',
                    label: '15 days'
                  }, {
                    value: '30',
                    label: '30 days'
                  }, {
                    value: '45',
                    label: '45 days'
                  }, {
                    value: '60',
                    label: '60 days'
                  }].map(term => <button key={term.value} onClick={() => setPaymentTerms(term.value)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', paymentTerms === term.value ? 'bg-trustopay-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')} data-id="element-3169">
                            {term.label}
                          </button>)}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2" data-id="element-3170">
                        After each invoice is generated
                      </p>
                    </div>

                    {/* Auto-send + Notifications */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3" data-id="element-3171">
                      <div className="flex items-center justify-between" data-id="element-3172">
                        <div data-id="element-3173">
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-3174">
                            Auto-send
                          </p>
                          <p className="text-[10px] text-gray-400" data-id="element-3175">
                            Send automatically when generated
                          </p>
                        </div>
                        <button onClick={() => setAutoSend(!autoSend)} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200', autoSend ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-3176">
                          <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', autoSend ? 'translate-x-6' : 'translate-x-0')} data-id="element-3177" />
                        </button>
                      </div>

                      {!autoSend && <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5" data-id="element-3178">
                          <AlertCircle size={12} data-id="element-3179" />
                          Invoices will be created as drafts for manual review
                        </p>}

                      <div className="h-px bg-gray-100" data-id="element-3180" />

                      <div className="flex items-center justify-between" data-id="element-3181">
                        <div data-id="element-3182">
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-3183">
                            Notify before sending
                          </p>
                          <p className="text-[10px] text-gray-400" data-id="element-3184">
                            Preview invoice before it's sent
                          </p>
                        </div>
                        <button onClick={() => setNotifyBeforeSend(!notifyBeforeSend)} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200', notifyBeforeSend ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-3185">
                          <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', notifyBeforeSend ? 'translate-x-6' : 'translate-x-0')} data-id="element-3186" />
                        </button>
                      </div>

                      <div className="h-px bg-gray-100" data-id="element-3187" />

                      <div className="flex items-center gap-3" data-id="element-3188">
                        <Clock size={16} className="text-gray-400 flex-shrink-0" data-id="element-3189" />
                        <span className="text-sm text-gray-600" data-id="element-3190">Remind</span>
                        <input type="number" value={reminderDays} onChange={e => setReminderDays(e.target.value)} className="w-12 h-8 rounded border border-gray-300 text-center text-sm" data-id="element-3191" />
                        <span className="text-sm text-gray-600" data-id="element-3192">
                          days before
                        </span>
                      </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="bg-blue-50 p-3.5 rounded-xl flex gap-3 items-start" data-id="element-3193">
                      <Calendar size={16} className="text-blue-600 mt-0.5 flex-shrink-0" data-id="element-3194" />
                      <div data-id="element-3195">
                        <p className="text-xs font-bold text-blue-700 mb-1" data-id="element-3196">
                          Schedule Preview
                        </p>
                        <p className="text-[11px] text-blue-600 leading-relaxed" data-id="element-3197">
                          {frequency === 'daily' && 'Invoices generated every day'}
                          {frequency === 'weekly' && `Every week on ${weeklyDays.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`}
                          {frequency === 'monthly' && (monthlyOption === 'last' ? 'Last day of every month' : `Day ${monthlyDay} of every month`)}
                          {frequency === 'quarterly' && 'Every 3 months'}
                          {frequency === 'yearly' && 'Once every year'}
                          <br data-id="element-3198" />
                          <br data-id="element-3199" />
                          Next 3 invoices:
                          <br data-id="element-3200" />• Nov 24, 2023
                          <br data-id="element-3201" />• Dec 24, 2023
                          <br data-id="element-3202" />• Jan 24, 2024
                        </p>
                        {endCondition === 'count' && <p className="text-[10px] text-blue-500 mt-2 font-medium" data-id="element-3203">
                            Total: {endAfterCount} invoices × {formatINR(total)}{' '}
                            = {formatINR(total * Number(endAfterCount))}
                          </p>}
                      </div>
                    </div>
                  </motion.div>}
              </AnimatePresence>

              {/* 3b. Milestone Builder (only if milestones) */}
              <AnimatePresence data-id="element-3204">
                {paymentType === 'milestone' && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} className="space-y-3 overflow-hidden" data-id="element-3205">
                    <div className="flex items-center justify-between" data-id="element-3206">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3207">
                        Payment Schedule
                      </p>
                      {!milestonesValid && total > 0 && <button onClick={splitEqually} className="text-[10px] font-bold text-trustopay-purple bg-purple-50 px-2.5 py-1 rounded-full" data-id="element-3208">
                          Split Equally
                        </button>}
                    </div>

                    {/* Allocation bar */}
                    {total > 0 && <div className="bg-white px-4 py-3 rounded-xl border border-gray-200" data-id="element-3209">
                        <div className="flex justify-between items-center mb-1.5" data-id="element-3210">
                          <span className="text-[11px] font-medium text-gray-500" data-id="element-3211">
                            Allocated
                          </span>
                          <span className={cn('text-[11px] font-bold', milestonesValid ? 'text-green-600' : milestoneRemaining < 0 ? 'text-red-500' : 'text-orange-500')} data-id="element-3212">
                            {formatINR(milestoneAllocated)} / {formatINR(total)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden" data-id="element-3213">
                          <motion.div className={cn('h-full rounded-full', milestonesValid ? 'bg-green-500' : milestoneRemaining < 0 ? 'bg-red-400' : 'bg-orange-400')} initial={{
                    width: 0
                  }} animate={{
                    width: `${Math.min(milestoneAllocated / total * 100, 100)}%`
                  }} transition={{
                    duration: 0.3
                  }} data-id="element-3214" />
                        </div>
                        {!milestonesValid && total > 0 && <p className={cn('text-[10px] mt-1 flex items-center gap-1', milestoneRemaining < 0 ? 'text-red-500' : 'text-orange-500')} data-id="element-3215">
                            <AlertCircle size={10} data-id="element-3216" />
                            {milestoneRemaining < 0 ? `Over by ${formatINR(Math.abs(milestoneRemaining))}` : `${formatINR(milestoneRemaining)} left`}
                          </p>}
                      </div>}

                    {/* Milestone cards */}
                    {milestones.map((ms, index) => <motion.div key={ms.id} initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: index * 0.05
              }} className="bg-white p-4 rounded-xl border border-gray-200 relative" data-id="element-3217">
                        <div className="flex items-center justify-between mb-3" data-id="element-3218">
                          <div className="flex items-center gap-2" data-id="element-3219">
                            <div className="w-6 h-6 rounded-full bg-trustopay-purple text-white flex items-center justify-center text-[10px] font-bold" data-id="element-3220">
                              {index + 1}
                            </div>
                            <Input placeholder="e.g. Design Phase" value={ms.name} onChange={e => updateMilestone(ms.id, 'name', e.target.value)} className="h-8 text-xs font-semibold border-0 bg-transparent p-0 focus-visible:ring-0 text-trustopay-navy" data-id="element-3221" />
                          </div>
                          {milestones.length > 2 && <button onClick={() => removeMilestone(ms.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors" data-id="element-3222">
                              <Trash2 size={14} data-id="element-3223" />
                            </button>}
                        </div>
                        <div className="flex gap-3" data-id="element-3224">
                          <div className="flex-1" data-id="element-3225">
                            <Input type="number" placeholder="Amount (₹)" label="Amount" value={ms.amount || ''} onChange={e => updateMilestone(ms.id, 'amount', Number(e.target.value))} className="h-10 text-sm" data-id="element-3226" />
                          </div>
                          <div className="flex-1" data-id="element-3227">
                            <Input type="date" label="Due Date" value={ms.dueDate} onChange={e => updateMilestone(ms.id, 'dueDate', e.target.value)} className="h-10 text-sm" data-id="element-3228" />
                          </div>
                        </div>
                      </motion.div>)}

                    <Button variant="outline" onClick={addMilestone} className="w-full border-dashed" data-id="element-3229">
                      <Plus size={16} className="mr-2" data-id="element-3230" /> Add Milestone
                    </Button>
                  </motion.div>}
              </AnimatePresence>

              {/* 4. Items Section */}
              <div className="space-y-4" data-id="element-3231">
                <div className="flex justify-between items-center" data-id="element-3232">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3233">
                    Line Items
                  </p>
                  <div className="relative" data-id="element-3234">
                    <button onClick={() => setShowSavedItems(!showSavedItems)} className="text-xs font-medium text-trustopay-purple flex items-center gap-1 hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors" data-id="element-3235">
                      Saved Items <ChevronDown size={14} data-id="element-3236" />
                    </button>
                    {showSavedItems && <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSavedItems(false)} data-id="element-3237" />
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden" data-id="element-3238">
                          {savedItems.map(item => <button key={item.id} onClick={() => addSavedItem(item)} className="w-full text-left px-4 py-2 hover:bg-purple-50 text-sm text-gray-700 border-b border-gray-50 last:border-none" data-id="element-3239">
                              <p className="font-medium" data-id="element-3240">{item.name}</p>
                              <p className="text-xs text-gray-500" data-id="element-3241">
                                {formatINR(item.rate)}
                              </p>
                            </button>)}
                        </div>
                      </>}
                  </div>
                </div>

                {items.map(item => <Card key={item.id} className="p-4 relative" data-id="element-3242">
                    {items.length > 1 && <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" data-id="element-3243">
                        <Trash2 size={16} data-id="element-3244" />
                      </button>}
                    <div className="space-y-3" data-id="element-3245">
                      <Input placeholder="Item name" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="border-gray-200" data-id="element-3246" />
                      <div className="flex gap-3" data-id="element-3247">
                        <div className="w-24" data-id="element-3248">
                          <Input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} data-id="element-3249" />
                        </div>
                        <div className="flex-1" data-id="element-3250">
                          <Input type="number" placeholder="Rate (₹)" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} data-id="element-3251" />
                        </div>
                      </div>
                    </div>
                  </Card>)}

                <Button variant="outline" onClick={addItem} className="w-full border-dashed" data-id="element-3252">
                  <Plus size={16} className="mr-2" data-id="element-3253" /> Add Item
                </Button>
              </div>

              {/* 5. GST Toggle */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200" data-id="element-3254">
                <div data-id="element-3255">
                  <p className="font-medium text-trustopay-navy" data-id="element-3256">
                    Include GST (18%)
                  </p>
                  <p className="text-xs text-gray-500" data-id="element-3257">Tax added to total</p>
                </div>
                <button onClick={() => setIncludeGST(!includeGST)} className={cn('w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out', includeGST ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-3258">
                  <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out', includeGST ? 'translate-x-6' : 'translate-x-0')} data-id="element-3259" />
                </button>
              </div>

              {/* 6. Totals */}
              <Card className="p-4 space-y-3" data-id="element-3260">
                <div className="flex justify-between text-sm" data-id="element-3261">
                  <span className="text-gray-500" data-id="element-3262">Subtotal</span>
                  <span data-id="element-3263">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-3264">
                  <span className="text-gray-500" data-id="element-3265">GST (18%)</span>
                  <span data-id="element-3266">{includeGST ? formatINR(tax) : '₹0'}</span>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-trustopay-navy" data-id="element-3267">
                  <span data-id="element-3268">Total</span>
                  <span data-id="element-3269">{formatINR(total)}</span>
                </div>
              </Card>

              {/* 7. Notes / Terms — BOTTOM */}
              <div className="bg-white p-4 rounded-xl border border-gray-200" data-id="element-3270">
                <label className="mb-1.5 block text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-3271">
                  Notes & Terms
                </label>
                <textarea className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:bg-white h-20 resize-none transition-colors" placeholder="Payment terms, notes, or special instructions..." value={notes} onChange={e => setNotes(e.target.value)} data-id="element-3272" />
              </div>
            </motion.div>}

          {step === 3 && <motion.div key="step3" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} className="p-5 flex flex-col pb-8" data-id="element-3273">
              <div className="text-center mb-6 mt-4" data-id="element-3274">
                <div className="w-16 h-16 bg-purple-100 text-trustopay-purple rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-3275">
                  <Check size={32} data-id="element-3276" />
                </div>
                <h2 className="text-2xl font-bold text-trustopay-navy" data-id="element-3277">
                  Review Invoice
                </h2>
                <p className="text-gray-500" data-id="element-3278">
                  Ready to send to {selectedCustomer?.name}
                </p>
              </div>

              <Card className="p-6 space-y-4 mb-4" data-id="element-3279">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100" data-id="element-3280">
                  <span className="text-gray-500" data-id="element-3281">Amount Due</span>
                  <div className="flex items-center gap-2" data-id="element-3282">
                    <span className="text-2xl font-bold text-trustopay-navy" data-id="element-3283">
                      {formatINR(total)}
                    </span>
                    <button onClick={() => setStep(2)} className="p-1.5 hover:bg-gray-100 rounded-full text-trustopay-purple" data-id="element-3284">
                      <Edit2 size={16} data-id="element-3285" />
                    </button>
                  </div>
                </div>

                {/* Recurring Badge in Review */}
                {paymentType === 'recurring' && <div className="flex items-center gap-2 pb-3 border-b border-gray-100" data-id="element-3286">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600" data-id="element-3287">
                      <RefreshCw size={14} data-id="element-3288" />
                    </div>
                    <div data-id="element-3289">
                      <p className="text-sm font-medium text-trustopay-navy capitalize" data-id="element-3290">
                        {frequency} Recurring
                      </p>
                      <p className="text-[10px] text-gray-400" data-id="element-3291">
                        {endCondition === 'never' ? 'Until cancelled' : endCondition === 'count' ? `After ${endAfterCount} invoices` : `Until ${endDate}`}
                        {autoSend ? ' • Auto-send on' : ''}
                      </p>
                    </div>
                  </div>}

                {/* Payment Structure Badge */}
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100" data-id="element-3292">
                  <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', paymentType === 'full' ? 'bg-green-100' : paymentType === 'milestone' ? 'bg-purple-100' : 'bg-blue-100')} data-id="element-3293">
                    {paymentType === 'full' ? <Banknote size={14} className="text-green-600" data-id="element-3294" /> : paymentType === 'milestone' ? <Layers size={14} className="text-trustopay-purple" data-id="element-3295" /> : <RefreshCw size={14} className="text-blue-600" data-id="element-3296" />}
                  </div>
                  <div data-id="element-3297">
                    <p className="text-sm font-medium text-trustopay-navy" data-id="element-3298">
                      {paymentType === 'full' ? 'Full Payment' : paymentType === 'milestone' ? `${milestones.length} Milestones` : 'Recurring Payment'}
                    </p>
                    <p className="text-[10px] text-gray-400" data-id="element-3299">
                      {paymentType === 'full' ? `Due: ${dueDate || 'Not set'}` : paymentType === 'milestone' ? `Split into ${milestones.length} payments` : `${frequency} • Next: Nov 24, 2023`}
                    </p>
                  </div>
                </div>

                {/* Milestone Preview */}
                {paymentType === 'milestone' && <div className="space-y-2 pb-3 border-b border-gray-100" data-id="element-3300">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2" data-id="element-3301">
                      Payment Schedule
                    </p>
                    {milestones.map((ms, i) => <div key={ms.id} className="flex items-center gap-3" data-id="element-3302">
                        <div className="w-5 h-5 rounded-full bg-trustopay-purple text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0" data-id="element-3303">
                          {i + 1}
                        </div>
                        <div className="flex-1 flex justify-between items-center" data-id="element-3304">
                          <div data-id="element-3305">
                            <p className="text-sm text-trustopay-navy font-medium" data-id="element-3306">
                              {ms.name || `Milestone ${i + 1}`}
                            </p>
                            <p className="text-[10px] text-gray-400" data-id="element-3307">
                              {ms.dueDate || 'No date set'}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-trustopay-navy" data-id="element-3308">
                            {formatINR(ms.amount)}
                          </p>
                        </div>
                      </div>)}
                    {/* Progress dots */}
                    <div className="flex gap-1 pt-2" data-id="element-3309">
                      {milestones.map((_, i) => <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200" data-id="element-3310" />)}
                    </div>
                  </div>}

                {/* Line Items */}
                <div className="py-2 space-y-2 border-b border-gray-100 pb-4" data-id="element-3311">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2" data-id="element-3312">
                    Items
                  </p>
                  {items.map(item => <div key={item.id} className="flex justify-between text-sm" data-id="element-3313">
                      <span className="text-gray-700" data-id="element-3314">
                        {item.name || 'Item'} x{item.qty}
                      </span>
                      <span className="font-medium" data-id="element-3315">
                        {formatINR(item.rate * item.qty)}
                      </span>
                    </div>)}
                  {includeGST && <div className="flex justify-between text-sm text-gray-500 pt-1" data-id="element-3316">
                      <span data-id="element-3317">GST (18%)</span>
                      <span data-id="element-3318">{formatINR(tax)}</span>
                    </div>}
                </div>

                <div className="space-y-2 text-sm pt-2" data-id="element-3319">
                  <div className="flex justify-between" data-id="element-3320">
                    <span className="text-gray-500" data-id="element-3321">Invoice No</span>
                    <span className="font-medium" data-id="element-3322">{invoiceNumber}</span>
                  </div>
                  {paymentType === 'full' && <div className="flex justify-between" data-id="element-3323">
                      <span className="text-gray-500" data-id="element-3324">Due Date</span>
                      <span className="font-medium" data-id="element-3325">
                        {dueDate || 'Not set'}
                      </span>
                    </div>}
                  <div className="flex justify-between" data-id="element-3326">
                    <span className="text-gray-500" data-id="element-3327">Customer</span>
                    <span className="font-medium" data-id="element-3328">
                      {selectedCustomer?.phone}
                    </span>
                  </div>
                  {notes && <div className="pt-2" data-id="element-3329">
                      <p className="text-xs text-gray-500 mb-1" data-id="element-3330">Notes</p>
                      <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded" data-id="element-3331">
                        {notes}
                      </p>
                    </div>}
                </div>
              </Card>

              {/* Delivery Channels */}
              <Card className="p-4 mb-4" data-id="element-3332">
                <p className="font-bold text-trustopay-navy mb-3" data-id="element-3333">
                  Send Invoice Via
                </p>
                <div className="space-y-3" data-id="element-3334">
                  <div className="flex items-center justify-between" data-id="element-3335">
                    <div className="flex items-center gap-3" data-id="element-3336">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" data-id="element-3337">
                        <Bell size={14} className="text-trustopay-purple" data-id="element-3338" />
                      </div>
                      <div data-id="element-3339">
                        <p className="text-sm font-medium text-trustopay-navy" data-id="element-3340">
                          App Notification
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-3341">Mandatory</p>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded bg-trustopay-purple flex items-center justify-center" data-id="element-3342">
                      <Check size={12} className="text-white" data-id="element-3343" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-3344">
                    <div className="flex items-center gap-3" data-id="element-3345">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center" data-id="element-3346">
                        <MessageCircle size={14} className="text-green-600" data-id="element-3347" />
                      </div>
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-3348">
                        WhatsApp
                      </p>
                    </div>
                    <button onClick={() => setSendViaWhatsApp(!sendViaWhatsApp)} className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors', sendViaWhatsApp ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-3349">
                      {sendViaWhatsApp && <Check size={12} className="text-white" data-id="element-3350" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-3351">
                    <div className="flex items-center gap-3" data-id="element-3352">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center" data-id="element-3353">
                        <Mail size={14} className="text-blue-600" data-id="element-3354" />
                      </div>
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-3355">
                        Email
                      </p>
                    </div>
                    <button onClick={() => setSendViaEmail(!sendViaEmail)} className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors', sendViaEmail ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-3356">
                      {sendViaEmail && <Check size={12} className="text-white" data-id="element-3357" />}
                    </button>
                  </div>
                </div>
              </Card>

              {/* Reminders */}
              <Card className="p-4 mb-4" data-id="element-3358">
                <div className="flex items-center justify-between mb-1" data-id="element-3359">
                  <p className="font-bold text-trustopay-navy" data-id="element-3360">
                    Payment Reminders
                  </p>
                  <button onClick={() => setEnableReminders(!enableReminders)} className={cn('w-10 h-5 rounded-full p-0.5 transition-colors duration-200', enableReminders ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-3361">
                    <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', enableReminders ? 'translate-x-5' : 'translate-x-0')} data-id="element-3362" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3" data-id="element-3363">
                  Automatically send payment reminders before due date
                </p>

                {enableReminders && <motion.div initial={{
              opacity: 0,
              height: 0
            }} animate={{
              opacity: 1,
              height: 'auto'
            }} exit={{
              opacity: 0,
              height: 0
            }} className="space-y-2 pt-2 border-t border-gray-100" data-id="element-3364">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2" data-id="element-3365">
                      Remind Via
                    </p>

                    <div className="flex items-center justify-between py-1" data-id="element-3366">
                      <div className="flex items-center gap-2" data-id="element-3367">
                        <Bell size={14} className="text-trustopay-purple" data-id="element-3368" />
                        <span className="text-sm text-gray-700" data-id="element-3369">App</span>
                      </div>
                      <div className="w-4 h-4 rounded bg-trustopay-purple flex items-center justify-center" data-id="element-3370">
                        <Check size={10} className="text-white" data-id="element-3371" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1" data-id="element-3372">
                      <div className="flex items-center gap-2" data-id="element-3373">
                        <MessageCircle size={14} className="text-green-600" data-id="element-3374" />
                        <span className="text-sm text-gray-700" data-id="element-3375">WhatsApp</span>
                      </div>
                      <button onClick={() => setReminderWhatsApp(!reminderWhatsApp)} className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors', reminderWhatsApp ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300')} data-id="element-3376">
                        {reminderWhatsApp && <Check size={8} className="text-white" data-id="element-3377" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1" data-id="element-3378">
                      <div className="flex items-center gap-2" data-id="element-3379">
                        <Mail size={14} className="text-blue-600" data-id="element-3380" />
                        <span className="text-sm text-gray-700" data-id="element-3381">Email</span>
                      </div>
                      <button onClick={() => setReminderEmail(!reminderEmail)} className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-colors', reminderEmail ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300')} data-id="element-3382">
                        {reminderEmail && <Check size={8} className="text-white" data-id="element-3383" />}
                      </button>
                    </div>
                  </motion.div>}
              </Card>

              <Button variant="outline" className="w-full mb-3" onClick={() => setStep(2)} data-id="element-3384">
                Edit Invoice Details
              </Button>

              <Button className="w-full h-14 text-lg" onClick={onClose} data-id="element-3385">
                {paymentType === 'recurring' ? 'Create Recurring Invoice' : 'Send Invoice'}
              </Button>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Footer (step 2 only) */}
      {step === 2 && <div className="p-5 border-t border-gray-100 bg-white" data-id="element-3386">
          <Button className="w-full h-12" onClick={handleNext} disabled={paymentType === 'milestone' && !milestonesValid && total > 0} data-id="element-3387">
            {paymentType === 'milestone' && !milestonesValid && total > 0 ? 'Allocate milestone amounts to continue' : paymentType === 'recurring' ? 'Create Recurring Invoice' : 'Continue'}
          </Button>
        </div>}
    </div>;
}