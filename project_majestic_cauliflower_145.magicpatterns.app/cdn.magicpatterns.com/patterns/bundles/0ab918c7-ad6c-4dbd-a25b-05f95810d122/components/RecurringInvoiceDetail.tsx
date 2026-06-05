import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, PauseCircle, PlayCircle, Calendar, RefreshCw, CheckCircle2, Clock, ChevronRight, MoreVertical, X, Copy, Trash2, StopCircle, FileDown, Eye, AlertTriangle, AlertCircle, Lightbulb, TrendingUp, Send, Mail, MessageCircle, Check, DollarSign, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { StatusBadge } from './StatusBadge';
import { formatINR, cn } from '../lib/utils';
interface RecurringInvoiceDetailProps {
  isOpen: boolean;
  onClose: () => void;
  recurringInvoice: any;
}
export function RecurringInvoiceDetail({
  isOpen,
  onClose,
  recurringInvoice
}: RecurringInvoiceDetailProps) {
  const [localRec, setLocalRec] = useState<any>(recurringInvoice);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showPauseConfirm, setShowPauseConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditScope, setShowEditScope] = useState(false);
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [pauseReason, setPauseReason] = useState('');
  const [endReason, setEndReason] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  useEffect(() => {
    setLocalRec(recurringInvoice);
  }, [recurringInvoice]);
  if (!localRec) return null;
  const isPaused = localRec.status === 'paused';
  const isEnded = localRec.status === 'ended';
  const isActive = localRec.status === 'active';
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({
      type,
      message
    });
    setTimeout(() => setToast(null), 3000);
  };
  const handlePause = () => {
    setShowPauseConfirm(false);
    setShowActionMenu(false);
    setLocalRec({
      ...localRec,
      status: 'paused'
    });
    showToast('success', 'Recurring invoice paused');
  };
  const handleResume = () => {
    setLocalRec({
      ...localRec,
      status: 'active'
    });
    showToast('success', `Resumed. Next invoice: ${localRec.nextDate}`);
  };
  const handleEnd = () => {
    setShowEndConfirm(false);
    setShowActionMenu(false);
    setLocalRec({
      ...localRec,
      status: 'ended'
    });
    showToast('success', 'Recurring invoice ended. History preserved.');
  };
  const handleDelete = () => {
    setShowDeleteConfirm(false);
    showToast('success', 'Recurring invoice deleted');
    setTimeout(onClose, 1500);
  };
  const handleDuplicate = () => {
    setShowActionMenu(false);
    showToast('success', 'Recurring template duplicated as draft');
  };
  // Mock data
  const totalGenerated = localRec.totalGenerated || 3;
  const paidCount = Math.max(totalGenerated - 1, 0);
  const pendingCount = totalGenerated - paidCount;
  const totalRevenue = localRec.amount * totalGenerated;
  const paidRevenue = localRec.amount * paidCount;
  const pendingRevenue = localRec.amount * pendingCount;
  const paymentRate = totalGenerated > 0 ? Math.round(paidCount / totalGenerated * 100) : 0;
  const history = [{
    id: 'INV-045',
    date: 'Oct 24, 2023',
    amount: localRec.amount,
    status: 'paid' as const
  }, {
    id: 'INV-038',
    date: 'Sep 24, 2023',
    amount: localRec.amount,
    status: 'paid' as const
  }, {
    id: 'INV-031',
    date: 'Aug 24, 2023',
    amount: localRec.amount,
    status: 'pending' as const
  }];
  const upcoming = [{
    date: localRec.nextDate || 'Nov 24, 2023',
    amount: localRec.amount
  }, {
    date: 'Dec 24, 2023',
    amount: localRec.amount
  }, {
    date: 'Jan 24, 2024',
    amount: localRec.amount
  }];
  const frequencyLabel = (() => {
    switch (localRec.frequency) {
      case 'weekly':
        return 'Every week';
      case 'monthly':
        return 'Every month on the 24th';
      case 'quarterly':
        return 'Every 3 months';
      case 'yearly':
        return 'Every year';
      default:
        return `Every ${localRec.frequency}`;
    }
  })();
  return <AnimatePresence data-id="element-2377">
      {isOpen && <motion.div initial={{
      x: '100%'
    }} animate={{
      x: 0
    }} exit={{
      x: '100%'
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-2378">
          {/* Toast */}
          <AnimatePresence data-id="element-2379">
            {toast && <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', toast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-2380">
                {toast.type === 'success' ? <CheckCircle2 size={16} data-id="element-2381" /> : <AlertCircle size={16} data-id="element-2382" />}
                {toast.message}
              </motion.div>}
          </AnimatePresence>

          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10" data-id="element-2383">
            <div className="flex items-center gap-3" data-id="element-2384">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-2385">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-2386" />
              </button>
              <div data-id="element-2387">
                <h2 className="font-bold text-lg text-trustopay-navy leading-tight" data-id="element-2388">
                  Recurring Invoice
                </h2>
                <p className="text-[10px] text-gray-400 capitalize" data-id="element-2389">
                  {localRec.frequency} • {localRec.client}
                </p>
              </div>
            </div>
            <button onClick={() => setShowActionMenu(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2390">
              <MoreVertical size={20} data-id="element-2391" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-28 space-y-5" data-id="element-2392">
            {/* Status + Amount Card */}
            <Card className="p-5" data-id="element-2393">
              <div className="flex justify-between items-start mb-4" data-id="element-2394">
                <div data-id="element-2395">
                  <p className="text-xs text-gray-500 mb-1" data-id="element-2396">Template for</p>
                  <h3 className="font-bold text-xl text-trustopay-navy" data-id="element-2397">
                    {localRec.client}
                  </h3>
                </div>
                <StatusBadge status={localRec.status} data-id="element-2398" />
              </div>

              <div className="flex items-center gap-3 mb-5" data-id="element-2399">
                <div className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide" data-id="element-2400">
                  {localRec.frequency}
                </div>
                <div className="h-1 w-1 rounded-full bg-gray-300" data-id="element-2401" />
                <p className="font-bold text-trustopay-navy text-lg" data-id="element-2402">
                  {formatINR(localRec.amount)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100" data-id="element-2403">
                <div data-id="element-2404">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" data-id="element-2405">
                    Next Invoice
                  </p>
                  <div className="flex items-center gap-1.5 text-trustopay-navy font-medium text-sm" data-id="element-2406">
                    <Calendar size={14} className="text-trustopay-purple" data-id="element-2407" />
                    {isPaused ? <span className="text-amber-600" data-id="element-2408">Paused</span> : isEnded ? <span className="text-gray-400" data-id="element-2409">Ended</span> : localRec.nextDate}
                  </div>
                </div>
                <div data-id="element-2410">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" data-id="element-2411">
                    Generated
                  </p>
                  <div className="flex items-center gap-1.5 text-trustopay-navy font-medium text-sm" data-id="element-2412">
                    <RefreshCw size={14} className="text-trustopay-purple" data-id="element-2413" />
                    {totalGenerated} Invoices
                  </div>
                </div>
              </div>
            </Card>

            {/* Revenue Metrics */}
            <Card className="p-5" data-id="element-2414">
              <div className="flex items-center gap-2 mb-4" data-id="element-2415">
                <BarChart3 size={16} className="text-trustopay-purple" data-id="element-2416" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-2417">
                  Revenue Summary
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4" data-id="element-2418">
                <div className="text-center p-3 bg-gray-50 rounded-lg" data-id="element-2419">
                  <p className="text-lg font-bold text-trustopay-navy" data-id="element-2420">
                    {formatINR(totalRevenue)}
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-2421">Total</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg" data-id="element-2422">
                  <p className="text-lg font-bold text-green-600" data-id="element-2423">
                    {formatINR(paidRevenue)}
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-2424">Paid</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg" data-id="element-2425">
                  <p className="text-lg font-bold text-amber-600" data-id="element-2426">
                    {formatINR(pendingRevenue)}
                  </p>
                  <p className="text-[10px] text-gray-400" data-id="element-2427">Pending</p>
                </div>
              </div>

              <div className="flex items-center justify-between" data-id="element-2428">
                <span className="text-xs text-gray-500" data-id="element-2429">Payment Rate</span>
                <div className="flex items-center gap-2" data-id="element-2430">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden" data-id="element-2431">
                    <motion.div className="h-full bg-green-500 rounded-full" initial={{
                  width: 0
                }} animate={{
                  width: `${paymentRate}%`
                }} transition={{
                  duration: 0.6,
                  delay: 0.2
                }} data-id="element-2432" />
                  </div>
                  <span className="text-xs font-bold text-green-600" data-id="element-2433">
                    {paymentRate}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Configuration */}
            <Card className="p-5" data-id="element-2434">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4" data-id="element-2435">
                Configuration
              </h4>
              <div className="space-y-3" data-id="element-2436">
                <div className="flex justify-between text-sm" data-id="element-2437">
                  <span className="text-gray-500" data-id="element-2438">Schedule</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2439">
                    {frequencyLabel}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2440">
                  <span className="text-gray-500" data-id="element-2441">Started</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2442">
                    Aug 24, 2023
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2443">
                  <span className="text-gray-500" data-id="element-2444">Auto-send</span>
                  <span className="font-medium text-green-600 flex items-center gap-1" data-id="element-2445">
                    <Check size={12} data-id="element-2446" /> Enabled
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2447">
                  <span className="text-gray-500" data-id="element-2448">Send via</span>
                  <div className="flex items-center gap-1.5" data-id="element-2449">
                    <Mail size={12} className="text-blue-500" data-id="element-2450" />
                    <MessageCircle size={12} className="text-green-500" data-id="element-2451" />
                  </div>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2452">
                  <span className="text-gray-500" data-id="element-2453">End Condition</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2454">Never</span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2455">
                  <span className="text-gray-500" data-id="element-2456">Payment Terms</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2457">
                    Net 30
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2458">
                  <span className="text-gray-500" data-id="element-2459">Pre-send Reminder</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2460">
                    3 days before
                  </span>
                </div>
              </div>
            </Card>

            {/* Smart Suggestion — Price Review */}
            {isActive && totalGenerated >= 3 && <motion.div initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }} className="border-l-4 border-blue-400 bg-blue-50/50 rounded-r-xl p-4" data-id="element-2461">
                <div className="flex items-center gap-2 mb-1.5" data-id="element-2462">
                  <Lightbulb size={16} className="text-blue-600" data-id="element-2463" />
                  <p className="font-bold text-sm text-trustopay-navy" data-id="element-2464">
                    Price Review
                  </p>
                </div>
                <p className="text-xs text-gray-600 mb-3" data-id="element-2465">
                  You've been charging {formatINR(localRec.amount)}/
                  {localRec.frequency} for {totalGenerated} cycles. Consider
                  reviewing your pricing.
                </p>
                <div className="flex gap-2" data-id="element-2466">
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1 bg-white" data-id="element-2467">
                    <TrendingUp size={12} data-id="element-2468" /> Adjust Price
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs h-8 text-gray-400" data-id="element-2469">
                    Dismiss
                  </Button>
                </div>
              </motion.div>}

            {/* Invoice Timeline */}
            <Card className="p-5" data-id="element-2470">
              <div className="flex justify-between items-center mb-5" data-id="element-2471">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-2472">
                  Invoice History
                </h4>
                <button onClick={() => setShowAllInvoices(!showAllInvoices)} className="text-xs font-bold text-trustopay-purple flex items-center gap-1" data-id="element-2473">
                  {showAllInvoices ? 'Show Less' : 'View All'}{' '}
                  <ChevronRight size={12} data-id="element-2474" />
                </button>
              </div>

              <div className="relative pl-2 space-y-5" data-id="element-2475">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" data-id="element-2476" />

                {/* Upcoming (if active) */}
                {isActive && upcoming.slice(0, showAllInvoices ? 3 : 2).map((item, i) => <div key={`upcoming-${i}`} className="relative flex items-start gap-4 opacity-50" data-id="element-2477">
                      <div className="relative z-10 w-4 h-4 rounded-full border-2 border-dashed border-gray-300 bg-white mt-0.5" data-id="element-2478" />
                      <div className="flex-1" data-id="element-2479">
                        <div className="flex justify-between items-start" data-id="element-2480">
                          <p className="font-medium text-gray-500 text-sm" data-id="element-2481">
                            Scheduled
                          </p>
                          <p className="font-bold text-gray-500 text-sm" data-id="element-2482">
                            {formatINR(item.amount)}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5" data-id="element-2483">
                          <Calendar size={10} data-id="element-2484" /> {item.date}
                        </p>
                      </div>
                    </div>)}

                {/* Divider */}
                {isActive && <div className="relative flex items-center gap-4" data-id="element-2485">
                    <div className="relative z-10 w-4 h-0.5 bg-gray-200 ml-0" data-id="element-2486" />
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest" data-id="element-2487">
                      Past Invoices
                    </p>
                  </div>}

                {/* History */}
                {history.slice(0, showAllInvoices ? history.length : 3).map(item => <div key={item.id} className="relative flex items-start gap-4" data-id="element-2488">
                      <div className={cn('relative z-10 w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center', item.status === 'paid' ? 'bg-green-500 border-green-500' : 'bg-amber-500 border-amber-500')} data-id="element-2489">
                        {item.status === 'paid' ? <CheckCircle2 size={10} className="text-white" data-id="element-2490" /> : <Clock size={10} className="text-white" data-id="element-2491" />}
                      </div>
                      <div className="flex-1" data-id="element-2492">
                        <div className="flex justify-between items-start" data-id="element-2493">
                          <p className="font-medium text-trustopay-navy text-sm" data-id="element-2494">
                            {item.id}
                          </p>
                          <p className="font-bold text-trustopay-navy text-sm" data-id="element-2495">
                            {formatINR(item.amount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center mt-0.5" data-id="element-2496">
                          <p className="text-[10px] text-gray-400" data-id="element-2497">
                            {item.date}
                          </p>
                          <StatusBadge status={item.status} data-id="element-2498" />
                        </div>
                      </div>
                    </div>)}
              </div>
            </Card>

            {/* Template Preview */}
            <Card className="p-5" data-id="element-2499">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4" data-id="element-2500">
                Invoice Template
              </h4>
              <div className="space-y-3" data-id="element-2501">
                <div className="flex justify-between text-sm" data-id="element-2502">
                  <span className="text-gray-500" data-id="element-2503">Client</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2504">
                    {localRec.client}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2505">
                  <span className="text-gray-500" data-id="element-2506">Amount</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2507">
                    {formatINR(localRec.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2508">
                  <span className="text-gray-500" data-id="element-2509">Item</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2510">
                    {localRec.frequency === 'monthly' ? 'Monthly Retainer' : 'Service Fee'}
                  </span>
                </div>
                <div className="flex justify-between text-sm" data-id="element-2511">
                  <span className="text-gray-500" data-id="element-2512">GST</span>
                  <span className="font-medium text-trustopay-navy" data-id="element-2513">
                    18% included
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 text-xs gap-1" data-id="element-2514">
                <Eye size={14} data-id="element-2515" /> Preview Full Template
              </Button>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 flex gap-3" data-id="element-2516">
            {isActive && <>
                <Button variant="outline" className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => setShowPauseConfirm(true)} data-id="element-2517">
                  <PauseCircle size={18} className="mr-1.5" data-id="element-2518" /> Pause
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowEditScope(true)} data-id="element-2519">
                  <Edit2 size={18} className="mr-1.5" data-id="element-2520" /> Edit
                </Button>
              </>}
            {isPaused && <>
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleResume} data-id="element-2521">
                  <PlayCircle size={18} className="mr-1.5" data-id="element-2522" /> Resume
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowEditScope(true)} data-id="element-2523">
                  <Edit2 size={18} className="mr-1.5" data-id="element-2524" /> Edit
                </Button>
              </>}
            {isEnded && <>
                <Button variant="outline" className="flex-1 gap-1" data-id="element-2525">
                  <FileDown size={18} data-id="element-2526" /> Export History
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDuplicate} data-id="element-2527">
                  <Copy size={18} className="mr-1.5" data-id="element-2528" /> Duplicate
                </Button>
              </>}
          </div>

          {/* ACTION MENU */}
          <AnimatePresence data-id="element-2529">
            {showActionMenu && <>
                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowActionMenu(false)} data-id="element-2530" />
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
          }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] max-w-[430px] mx-auto overflow-hidden" data-id="element-2531">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center" data-id="element-2532">
                    <h3 className="font-bold text-trustopay-navy" data-id="element-2533">Actions</h3>
                    <button onClick={() => setShowActionMenu(false)} className="p-1 bg-gray-100 rounded-full" data-id="element-2534">
                      <X size={16} data-id="element-2535" />
                    </button>
                  </div>
                  <div className="p-2" data-id="element-2536">
                    {!isEnded && <button onClick={() => {
                setShowActionMenu(false);
                setShowEditScope(true);
              }} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2537">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600" data-id="element-2538">
                          <Edit2 size={20} data-id="element-2539" />
                        </div>
                        <div data-id="element-2540">
                          <p className="font-bold text-trustopay-navy" data-id="element-2541">
                            Edit Template
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2542">
                            Update invoice details or schedule
                          </p>
                        </div>
                      </button>}
                    <button onClick={handleDuplicate} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2543">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-trustopay-purple" data-id="element-2544">
                        <Copy size={20} data-id="element-2545" />
                      </div>
                      <div data-id="element-2546">
                        <p className="font-bold text-trustopay-navy" data-id="element-2547">
                          Duplicate
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-2548">
                          Create a copy as new recurring
                        </p>
                      </div>
                    </button>
                    {isActive && <button onClick={() => {
                setShowActionMenu(false);
                setShowPauseConfirm(true);
              }} className="w-full p-4 flex items-center gap-3 hover:bg-amber-50 rounded-xl text-left" data-id="element-2549">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600" data-id="element-2550">
                          <PauseCircle size={20} data-id="element-2551" />
                        </div>
                        <div data-id="element-2552">
                          <p className="font-bold text-amber-700" data-id="element-2553">Pause</p>
                          <p className="text-xs text-amber-500" data-id="element-2554">
                            Temporarily stop generating
                          </p>
                        </div>
                      </button>}
                    {isPaused && <button onClick={() => {
                setShowActionMenu(false);
                handleResume();
              }} className="w-full p-4 flex items-center gap-3 hover:bg-green-50 rounded-xl text-left" data-id="element-2555">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600" data-id="element-2556">
                          <PlayCircle size={20} data-id="element-2557" />
                        </div>
                        <div data-id="element-2558">
                          <p className="font-bold text-green-700" data-id="element-2559">Resume</p>
                          <p className="text-xs text-green-500" data-id="element-2560">
                            Continue generating invoices
                          </p>
                        </div>
                      </button>}
                    {!isEnded && <button onClick={() => {
                setShowActionMenu(false);
                setShowEndConfirm(true);
              }} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 rounded-xl text-left" data-id="element-2561">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" data-id="element-2562">
                          <StopCircle size={20} data-id="element-2563" />
                        </div>
                        <div data-id="element-2564">
                          <p className="font-bold text-red-600" data-id="element-2565">
                            End Recurring
                          </p>
                          <p className="text-xs text-red-400" data-id="element-2566">
                            Stop permanently, keep history
                          </p>
                        </div>
                      </button>}
                    {isEnded && <button onClick={() => {
                setShowActionMenu(false);
                setShowDeleteConfirm(true);
              }} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 rounded-xl text-left" data-id="element-2567">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" data-id="element-2568">
                          <Trash2 size={20} data-id="element-2569" />
                        </div>
                        <div data-id="element-2570">
                          <p className="font-bold text-red-600" data-id="element-2571">Delete</p>
                          <p className="text-xs text-red-400" data-id="element-2572">
                            Remove recurring invoice entirely
                          </p>
                        </div>
                      </button>}
                    <button onClick={() => {
                setShowActionMenu(false);
                showToast('success', 'Exporting history...');
              }} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2573">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" data-id="element-2574">
                        <FileDown size={20} data-id="element-2575" />
                      </div>
                      <div data-id="element-2576">
                        <p className="font-bold text-trustopay-navy" data-id="element-2577">
                          Export History
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-2578">
                          Download all generated invoices
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </>}
          </AnimatePresence>

          {/* PAUSE CONFIRM */}
          <AnimatePresence data-id="element-2579">
            {showPauseConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2580">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2581">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2582">
                    <PauseCircle size={24} className="text-amber-600" data-id="element-2583" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2584">
                    Pause Recurring Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-2" data-id="element-2585">
                    No invoices will be generated until you resume.
                  </p>
                  <p className="text-xs text-gray-400 text-center mb-4" data-id="element-2586">
                    Next scheduled: {localRec.nextDate}
                  </p>
                  <div className="mb-6" data-id="element-2587">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block" data-id="element-2588">
                      Reason (Optional)
                    </label>
                    <Input placeholder="e.g. Client requested hold" value={pauseReason} onChange={e => setPauseReason(e.target.value)} data-id="element-2589" />
                  </div>
                  <div className="flex gap-3" data-id="element-2590">
                    <Button variant="outline" className="flex-1" onClick={() => setShowPauseConfirm(false)} data-id="element-2591">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={handlePause} data-id="element-2592">
                      Pause
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* END CONFIRM */}
          <AnimatePresence data-id="element-2593">
            {showEndConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2594">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2595">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2596">
                    <StopCircle size={24} className="text-red-600" data-id="element-2597" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2598">
                    End Recurring Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4" data-id="element-2599">
                    This will permanently stop future invoice generation. Past
                    invoices and history will be preserved.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs space-y-1.5" data-id="element-2600">
                    <div className="flex items-center gap-2 text-gray-600" data-id="element-2601">
                      <Check size={12} className="text-green-500" data-id="element-2602" /> Past
                      invoices kept
                    </div>
                    <div className="flex items-center gap-2 text-gray-600" data-id="element-2603">
                      <Check size={12} className="text-green-500" data-id="element-2604" /> History
                      preserved
                    </div>
                    <div className="flex items-center gap-2 text-red-500" data-id="element-2605">
                      <X size={12} data-id="element-2606" /> Cannot be undone
                    </div>
                  </div>
                  <div className="mb-6" data-id="element-2607">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block" data-id="element-2608">
                      Reason (Optional)
                    </label>
                    <Input placeholder="e.g. Contract ended" value={endReason} onChange={e => setEndReason(e.target.value)} data-id="element-2609" />
                  </div>
                  <div className="flex gap-3" data-id="element-2610">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEndConfirm(false)} data-id="element-2611">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={handleEnd} data-id="element-2612">
                      End Recurring
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* DELETE CONFIRM */}
          <AnimatePresence data-id="element-2613">
            {showDeleteConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2614">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2615">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2616">
                    <Trash2 size={24} className="text-red-600" data-id="element-2617" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2618">
                    Delete Recurring Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-2619">
                    This will permanently remove this recurring invoice and its
                    configuration. Generated invoices will not be affected.
                  </p>
                  <div className="flex gap-3" data-id="element-2620">
                    <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)} data-id="element-2621">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={handleDelete} data-id="element-2622">
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* EDIT SCOPE MODAL */}
          <AnimatePresence data-id="element-2623">
            {showEditScope && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2624">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2625">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2626">
                    <Edit2 size={24} className="text-blue-600" data-id="element-2627" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2628">
                    Edit Recurring Invoice
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-2629">
                    What would you like to update?
                  </p>
                  <div className="space-y-3 mb-6" data-id="element-2630">
                    <button onClick={() => {
                setShowEditScope(false);
                showToast('success', 'Editing next invoice only...');
              }} className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-trustopay-purple hover:bg-purple-50 transition-all" data-id="element-2631">
                      <p className="font-bold text-trustopay-navy text-sm" data-id="element-2632">
                        This occurrence only
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5" data-id="element-2633">
                        Make one-time changes for the next invoice
                      </p>
                    </button>
                    <button onClick={() => {
                setShowEditScope(false);
                showToast('success', 'Editing template for all future invoices...');
              }} className="w-full p-4 border-2 border-gray-200 rounded-xl text-left hover:border-trustopay-purple hover:bg-purple-50 transition-all" data-id="element-2634">
                      <p className="font-bold text-trustopay-navy text-sm" data-id="element-2635">
                        All future invoices
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5" data-id="element-2636">
                        Update template for all upcoming invoices
                      </p>
                    </button>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setShowEditScope(false)} data-id="element-2637">
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>}
          </AnimatePresence>
        </motion.div>}
    </AnimatePresence>;
}