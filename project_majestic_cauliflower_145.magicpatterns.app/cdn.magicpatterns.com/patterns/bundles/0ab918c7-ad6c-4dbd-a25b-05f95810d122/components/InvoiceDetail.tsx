import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Share2, CheckCircle2, FileDown, Eye, FileText, ArrowUpRight, ArrowDownLeft, MoreVertical, Edit2, Copy, Trash2, XCircle, AlertTriangle, History, Activity, Check, X, AlertCircle, ChevronDown, ChevronUp, Clock, Link2, Mail, MessageCircle, Send, CheckCheck, Info, Lightbulb, Phone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { StatusBadge } from './StatusBadge';
import { formatINR, cn } from '../lib/utils';
interface InvoiceDetailProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}
export function InvoiceDetail({
  isOpen,
  onClose,
  invoice
}: InvoiceDetailProps) {
  const [activeView, setActiveView] = useState<'details' | 'preview'>('details');
  const [localInvoice, setLocalInvoice] = useState<any>(invoice);
  // Modal States
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false); // For Sent invoices
  const [showEditError, setShowEditError] = useState(false); // For Paid invoices
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // For Drafts
  const [showDeleteError, setShowDeleteError] = useState(false); // For Sent invoices
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showVoidPaidWarning, setShowVoidPaidWarning] = useState(false);
  // Form States
  const [voidReason, setVoidReason] = useState('');
  const [refundIssued, setRefundIssued] = useState<'yes' | 'no' | null>(null);
  // UI States
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(true);
  const [dismissedPrivacyNotice, setDismissedPrivacyNotice] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  useEffect(() => {
    setLocalInvoice(invoice);
  }, [invoice]);
  if (!localInvoice) return null;
  const isSent = localInvoice.type === 'sent';
  const isDraft = localInvoice.status === 'draft';
  const isPaid = localInvoice.status === 'paid';
  const isVoided = localInvoice.status === 'voided';
  const isPending = localInvoice.status === 'pending' || localInvoice.status === 'overdue';
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({
      type,
      message
    });
    setTimeout(() => setToast(null), 3000);
  };
  // Actions
  const handleEdit = () => {
    setShowActionMenu(false);
    if (isDraft) {
      // Direct edit
      showToast('success', 'Opening edit mode...');
    } else if (isPaid) {
      setShowEditError(true);
    } else if (isSent || isPending) {
      setShowEditWarning(true);
    }
  };
  const handleDelete = () => {
    setShowActionMenu(false);
    if (isDraft) {
      setShowDeleteConfirm(true);
    } else {
      setShowDeleteError(true);
    }
  };
  const handleVoid = () => {
    setShowActionMenu(false);
    if (isPaid) {
      setShowVoidPaidWarning(true);
    } else {
      setShowVoidConfirm(true);
    }
  };
  const handleDuplicate = () => {
    setShowActionMenu(false);
    showToast('success', `Invoice duplicated as INV-${Math.floor(Math.random() * 1000)} (Draft)`);
  };
  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    showToast('success', 'Draft deleted successfully');
    setTimeout(onClose, 1500);
  };
  const confirmVoid = () => {
    setShowVoidConfirm(false);
    setShowVoidPaidWarning(false);
    setLocalInvoice({
      ...localInvoice,
      status: 'voided'
    });
    showToast('success', 'Invoice voided. Client has been notified.');
  };
  // Mock Data
  const milestones = localInvoice.amount > 8000 ? [{
    id: 1,
    name: 'Design Phase',
    amount: localInvoice.amount * 0.3,
    status: 'paid',
    date: 'Oct 15'
  }, {
    id: 2,
    name: 'Development',
    amount: localInvoice.amount * 0.3,
    status: 'paid',
    date: 'Oct 24'
  }, {
    id: 3,
    name: 'Final Delivery',
    amount: localInvoice.amount * 0.4,
    status: 'pending',
    date: null
  }] : [];
  const subtotal = localInvoice.amount * 0.85;
  const gst = localInvoice.amount * 0.15;
  const invoiceDate = localInvoice.date || 'Oct 10, 2023';
  const dueDate = localInvoice.dueDate || 'Oct 31, 2023';
  const activityLog = [{
    date: 'Feb 8, 4:15 PM',
    icon: Link2,
    text: 'Payment link clicked (2nd time)',
    color: 'bg-orange-100 text-orange-600'
  }, {
    date: 'Feb 8, 4:00 PM',
    icon: Eye,
    text: 'Invoice viewed (3rd time)',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 7, 9:00 AM',
    icon: Eye,
    text: 'Invoice viewed via email link',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 6, 11:00 AM',
    icon: Link2,
    text: 'Payment link clicked',
    color: 'bg-orange-100 text-orange-600'
  }, {
    date: 'Feb 6, 10:30 AM',
    icon: Eye,
    text: 'Invoice viewed for first time',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 5, 3:45 PM',
    icon: CheckCheck,
    text: 'WhatsApp read by client',
    color: 'bg-green-100 text-green-600'
  }, {
    date: 'Feb 5, 2:15 PM',
    icon: Send,
    text: 'Invoice delivered (Email + WhatsApp)',
    color: 'bg-gray-100 text-gray-600'
  }, {
    date: 'Feb 5, 2:00 PM',
    icon: FileText,
    text: 'Invoice created',
    color: 'bg-gray-100 text-gray-600'
  }];
  const versionHistory = [{
    version: 'v3',
    date: 'Feb 10, 2026, 3:00 PM',
    changes: ['Changed: Due date', 'Old: Feb 15 → New: Feb 20']
  }, {
    version: 'v2',
    date: 'Feb 8, 2026, 10:00 AM',
    changes: ['Changed: Notes added']
  }, {
    version: 'v1',
    date: 'Feb 5, 2026, 2:00 PM',
    changes: ['Original Version']
  }];
  return <AnimatePresence data-id="element-851">
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
    }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-852">
          {/* Toast Notification */}
          <AnimatePresence data-id="element-853">
            {toast && <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', toast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-854">
                {toast.type === 'success' ? <CheckCircle2 size={16} data-id="element-855" /> : <AlertCircle size={16} data-id="element-856" />}
                {toast.message}
              </motion.div>}
          </AnimatePresence>

          {/* Header */}
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10" data-id="element-857">
            <div className="p-4 flex items-center justify-between" data-id="element-858">
              <div className="flex items-center" data-id="element-859">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-860">
                  <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-861" />
                </button>
                <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-862">
                  Invoice
                </h2>
              </div>
              <div className="flex gap-1" data-id="element-863">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-864">
                  <Share2 size={20} data-id="element-865" />
                </button>
                <button onClick={() => setShowActionMenu(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-866">
                  <MoreVertical size={20} data-id="element-867" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 relative" data-id="element-868">
              <button onClick={() => setActiveView('details')} className={`flex-1 pb-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeView === 'details' ? 'text-trustopay-purple' : 'text-gray-400'}`} data-id="element-869">
                <FileText size={15} data-id="element-870" /> Details
              </button>
              <button onClick={() => setActiveView('preview')} className={`flex-1 pb-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeView === 'preview' ? 'text-trustopay-purple' : 'text-gray-400'}`} data-id="element-871">
                <Eye size={15} data-id="element-872" /> Preview
              </button>
              <motion.div className="absolute bottom-0 h-0.5 bg-trustopay-purple" initial={false} animate={{
            left: activeView === 'details' ? '0%' : '50%',
            width: '50%'
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }} data-id="element-873" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-28" data-id="element-874">
            <AnimatePresence mode="wait" data-id="element-875">
              {activeView === 'details' ? <motion.div key="details" initial={{
            opacity: 0,
            x: -15
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -15
          }} transition={{
            duration: 0.2
          }} className="p-5 space-y-4" data-id="element-876">
                  {/* Invoice Header Card */}
                  <Card className="p-5" data-id="element-877">
                    <div className="flex items-center gap-2 mb-3" data-id="element-878">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSent ? 'bg-purple-100' : 'bg-blue-100'}`} data-id="element-879">
                        {isSent ? <ArrowUpRight size={16} className="text-trustopay-purple" data-id="element-880" /> : <ArrowDownLeft size={16} className="text-blue-600" data-id="element-881" />}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${isSent ? 'text-trustopay-purple' : 'text-blue-600'}`} data-id="element-882">
                        {isSent ? 'Invoice Sent' : 'Invoice Received'}
                      </span>
                      <div className="ml-auto" data-id="element-883">
                        <StatusBadge status={localInvoice.status} data-id="element-884" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-trustopay-navy mb-3" data-id="element-885">
                      {formatINR(localInvoice.amount)}
                    </h1>
                    <div className="flex justify-between text-sm" data-id="element-886">
                      <div data-id="element-887">
                        <p className="text-gray-400 text-xs" data-id="element-888">Invoice No</p>
                        <p className="font-medium text-trustopay-navy" data-id="element-889">
                          {localInvoice.number}
                        </p>
                      </div>
                      <div className="text-right" data-id="element-890">
                        <p className="text-gray-400 text-xs" data-id="element-891">Due Date</p>
                        <p className="font-medium text-trustopay-navy" data-id="element-892">
                          {dueDate}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Milestones */}
                  {milestones.length > 0 && <Card className="p-5" data-id="element-893">
                      <div className="flex justify-between items-center mb-4" data-id="element-894">
                        <h3 className="font-bold text-trustopay-navy" data-id="element-895">
                          Payment Schedule
                        </h3>
                        <span className="text-[10px] font-bold text-trustopay-purple bg-purple-50 px-2 py-1 rounded-full" data-id="element-896">
                          2 of 3 Paid
                        </span>
                      </div>
                      <div className="relative pl-2" data-id="element-897">
                        <div className="absolute left-[7px] top-2 bottom-6 w-0.5 bg-gray-100" data-id="element-898" />
                        <div className="space-y-5" data-id="element-899">
                          {milestones.map((ms, i) => <div key={i} className="relative flex items-start gap-4" data-id="element-900">
                              <div className={`relative z-10 w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${ms.status === 'paid' ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`} data-id="element-901">
                                {ms.status === 'paid' && <CheckCircle2 size={10} className="text-white" data-id="element-902" />}
                              </div>
                              <div className="flex-1" data-id="element-903">
                                <div className="flex justify-between items-start" data-id="element-904">
                                  <div data-id="element-905">
                                    <p className="font-medium text-trustopay-navy text-sm" data-id="element-906">
                                      {ms.name}
                                    </p>
                                    <p className="text-[11px] text-gray-400" data-id="element-907">
                                      {ms.status === 'paid' ? `Paid on ${ms.date}` : 'Pending'}
                                    </p>
                                  </div>
                                  <p className="font-bold text-trustopay-navy text-sm" data-id="element-908">
                                    {formatINR(ms.amount)}
                                  </p>
                                </div>
                              </div>
                            </div>)}
                        </div>
                      </div>
                    </Card>}

                  {/* Parties */}
                  <Card className="p-0 overflow-hidden" data-id="element-909">
                    <div className="p-4 border-b border-gray-100" data-id="element-910">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2" data-id="element-911">
                        Billed To
                      </p>
                      <div className="flex items-center gap-3" data-id="element-912">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-trustopay-purple font-bold" data-id="element-913">
                          {localInvoice.client?.charAt(0) || 'C'}
                        </div>
                        <div data-id="element-914">
                          <p className="font-bold text-trustopay-navy" data-id="element-915">
                            {localInvoice.client}
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-916">
                            client@example.com
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4" data-id="element-917">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2" data-id="element-918">
                        From
                      </p>
                      <div className="flex items-center gap-3" data-id="element-919">
                        <div className="w-10 h-10 rounded-full bg-trustopay-navy text-white flex items-center justify-center font-bold" data-id="element-920">
                          A
                        </div>
                        <div data-id="element-921">
                          <p className="font-bold text-trustopay-navy" data-id="element-922">
                            Arjun Mehta
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-923">
                            arjun@trustopay.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Items */}
                  <Card className="p-4" data-id="element-924">
                    <h3 className="font-bold text-trustopay-navy mb-4" data-id="element-925">
                      Items
                    </h3>
                    <div className="space-y-3" data-id="element-926">
                      <div className="flex justify-between items-start text-sm" data-id="element-927">
                        <div data-id="element-928">
                          <p className="font-medium text-trustopay-navy" data-id="element-929">
                            Web Design Services
                          </p>
                          <p className="text-gray-500" data-id="element-930">
                            1 x {formatINR(subtotal)}
                          </p>
                        </div>
                        <p className="font-medium text-trustopay-navy" data-id="element-931">
                          {formatINR(subtotal)}
                        </p>
                      </div>
                      <div className="h-px bg-gray-100" data-id="element-932" />
                      <div className="flex justify-between text-sm" data-id="element-933">
                        <span className="text-gray-500" data-id="element-934">Subtotal</span>
                        <span data-id="element-935">{formatINR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm" data-id="element-936">
                        <span className="text-gray-500" data-id="element-937">GST (18%)</span>
                        <span data-id="element-938">{formatINR(gst)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-trustopay-navy pt-2 border-t border-gray-100" data-id="element-939">
                        <span data-id="element-940">Total</span>
                        <span data-id="element-941">{formatINR(localInvoice.amount)}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Buyer Privacy Notice */}
                  {!isSent && !dismissedPrivacyNotice && <motion.div initial={{
              opacity: 0,
              y: -8
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2" data-id="element-942">
                      <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" data-id="element-943" />
                      <p className="text-xs text-blue-700 flex-1" data-id="element-944">
                        The sender will be notified that you viewed this
                        invoice.
                      </p>
                      <button onClick={() => setDismissedPrivacyNotice(true)} className="text-blue-400 hover:text-blue-600 flex-shrink-0" data-id="element-945">
                        <X size={14} data-id="element-946" />
                      </button>
                    </motion.div>}

                  {/* Delivery & Activity Tracking (Seller View Only) */}
                  {isSent && !isDraft && <Card className="p-5 space-y-5" data-id="element-947">
                      <div className="flex items-center justify-between" data-id="element-948">
                        <h3 className="font-bold text-trustopay-navy flex items-center gap-2" data-id="element-949">
                          <Activity size={16} className="text-trustopay-purple" data-id="element-950" />
                          Delivery & Activity
                        </h3>
                      </div>

                      {/* Sent Via Channels */}
                      <div className="space-y-3" data-id="element-951">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-952">
                          Sent via
                        </p>

                        {/* Email */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-id="element-953">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0" data-id="element-954">
                            <Mail size={14} className="text-blue-600" data-id="element-955" />
                          </div>
                          <div className="flex-1 min-w-0" data-id="element-956">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-957">
                              Email
                            </p>
                            <p className="text-[11px] text-gray-500 truncate" data-id="element-958">
                              tech@solutions.com
                            </p>
                            <div className="mt-1.5 space-y-1" data-id="element-959">
                              <div className="flex items-center gap-1.5" data-id="element-960">
                                <Check size={10} className="text-green-500" data-id="element-961" />
                                <span className="text-[10px] text-gray-400" data-id="element-962">
                                  Delivered on Feb 5, 2:15 PM
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5" data-id="element-963">
                                <Eye size={10} className="text-blue-500" data-id="element-964" />
                                <span className="text-[10px] text-blue-600 font-medium" data-id="element-965">
                                  Opened on Feb 6, 10:30 AM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-id="element-966">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" data-id="element-967">
                            <MessageCircle size={14} className="text-green-600" data-id="element-968" />
                          </div>
                          <div className="flex-1 min-w-0" data-id="element-969">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-970">
                              WhatsApp
                            </p>
                            <p className="text-[11px] text-gray-500" data-id="element-971">
                              +91 98765 43210
                            </p>
                            <div className="mt-1.5 space-y-1" data-id="element-972">
                              <div className="flex items-center gap-1.5" data-id="element-973">
                                <Check size={10} className="text-green-500" data-id="element-974" />
                                <span className="text-[10px] text-gray-400" data-id="element-975">
                                  Delivered on Feb 5, 2:15 PM
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5" data-id="element-976">
                                <CheckCheck size={10} className="text-blue-500" data-id="element-977" />
                                <span className="text-[10px] text-blue-600 font-medium" data-id="element-978">
                                  Read on Feb 5, 3:45 PM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" data-id="element-979" />

                      {/* Invoice Views */}
                      <div className="space-y-2" data-id="element-980">
                        <div className="flex items-center justify-between" data-id="element-981">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-982">
                            Invoice Views
                          </p>
                          <span className="text-[10px] font-bold text-trustopay-purple bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1" data-id="element-983">
                            <Eye size={10} data-id="element-984" /> 3 views
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-1" data-id="element-985">
                          {[{
                    time: 'Feb 6, 10:30 AM',
                    source: 'In-app'
                  }, {
                    time: 'Feb 7, 9:00 AM',
                    source: 'Email link'
                  }, {
                    time: 'Feb 8, 4:00 PM',
                    source: 'In-app'
                  }].map((view, i) => <div key={i} className="flex items-center gap-2" data-id="element-986">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" data-id="element-987" />
                              <span className="text-[11px] text-gray-500" data-id="element-988">
                                {view.time}
                              </span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded" data-id="element-989">
                                {view.source}
                              </span>
                            </div>)}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" data-id="element-990" />

                      {/* Payment Link */}
                      <div className="space-y-2" data-id="element-991">
                        <div className="flex items-center justify-between" data-id="element-992">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-993">
                            Payment Link
                          </p>
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full flex items-center gap-1" data-id="element-994">
                            <Link2 size={10} data-id="element-995" /> 2 clicks
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-1" data-id="element-996">
                          {[{
                    time: 'Feb 6, 11:00 AM'
                  }, {
                    time: 'Feb 8, 4:15 PM'
                  }].map((click, i) => <div key={i} className="flex items-center gap-2" data-id="element-997">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" data-id="element-998" />
                              <span className="text-[11px] text-gray-500" data-id="element-999">
                                {click.time}
                              </span>
                            </div>)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1" data-id="element-1000">
                          <AlertTriangle size={12} className="text-amber-500" data-id="element-1001" />
                          <span className="text-[11px] text-amber-600 font-medium" data-id="element-1002">
                            Not completed yet
                          </span>
                        </div>
                      </div>
                    </Card>}

                  {/* Smart Reminder Suggestion */}
                  {isSent && !isDraft && !isPaid && !isVoided && <motion.div initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} data-id="element-1003">
                      {localInvoice.status === 'overdue' ? <div className="border-l-4 border-amber-400 bg-amber-50/50 rounded-r-xl p-4" data-id="element-1004">
                          <div className="flex items-center gap-2 mb-1.5" data-id="element-1005">
                            <AlertTriangle size={16} className="text-amber-600" data-id="element-1006" />
                            <p className="font-bold text-sm text-trustopay-navy" data-id="element-1007">
                              Urgent Action Required
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 mb-3" data-id="element-1008">
                            Invoice is overdue and viewed 3 times but not paid.
                            Client may need a direct follow-up.
                          </p>
                          <div className="flex gap-2" data-id="element-1009">
                            <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-1010">
                              <Send size={12} data-id="element-1011" /> Send Reminder
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-1012">
                              <Phone size={12} data-id="element-1013" /> Call Client
                            </Button>
                          </div>
                        </div> : <div className="border-l-4 border-blue-400 bg-blue-50/50 rounded-r-xl p-4" data-id="element-1014">
                          <div className="flex items-center gap-2 mb-1.5" data-id="element-1015">
                            <Lightbulb size={16} className="text-blue-600" data-id="element-1016" />
                            <p className="font-bold text-sm text-trustopay-navy" data-id="element-1017">
                              Payment Almost Complete
                            </p>
                          </div>
                          <p className="text-xs text-gray-600 mb-3" data-id="element-1018">
                            Client clicked payment link but didn't complete.
                            They might be facing issues.
                          </p>
                          <div className="flex gap-2" data-id="element-1019">
                            <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-1020">
                              <MessageCircle size={12} data-id="element-1021" /> Contact Client
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-1022">
                              <Send size={12} data-id="element-1023" /> Send Help
                            </Button>
                          </div>
                        </div>}
                    </motion.div>}

                  {/* Version History */}
                  <Card className="overflow-hidden" data-id="element-1024">
                    <button onClick={() => setShowVersionHistory(!showVersionHistory)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors" data-id="element-1025">
                      <div className="flex items-center gap-2" data-id="element-1026">
                        <History size={16} className="text-gray-400" data-id="element-1027" />
                        <span className="font-bold text-sm text-trustopay-navy" data-id="element-1028">
                          Version History
                        </span>
                      </div>
                      {showVersionHistory ? <ChevronUp size={16} data-id="element-1029" /> : <ChevronDown size={16} data-id="element-1030" />}
                    </button>

                    <AnimatePresence data-id="element-1031">
                      {showVersionHistory && <motion.div initial={{
                  height: 0
                }} animate={{
                  height: 'auto'
                }} exit={{
                  height: 0
                }} className="overflow-hidden bg-gray-50 border-t border-gray-100" data-id="element-1032">
                          <div className="p-4 space-y-4" data-id="element-1033">
                            {versionHistory.map((ver, i) => <div key={i} className="relative pl-4 border-l-2 border-gray-200" data-id="element-1034">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300" data-id="element-1035" />
                                <p className="text-xs font-bold text-trustopay-navy" data-id="element-1036">
                                  {ver.version}
                                </p>
                                <p className="text-[10px] text-gray-400 mb-1" data-id="element-1037">
                                  {ver.date}
                                </p>
                                <ul className="space-y-0.5" data-id="element-1038">
                                  {ver.changes.map((change, j) => <li key={j} className="text-xs text-gray-600" data-id="element-1039">
                                      • {change}
                                    </li>)}
                                </ul>
                              </div>)}
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </Card>

                  {/* Activity Log */}
                  <div className="pt-4" data-id="element-1040">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1" data-id="element-1041">
                      Activity Log
                    </p>
                    <div className="space-y-6 pl-2" data-id="element-1042">
                      {activityLog.map((log, i) => <div key={i} className="flex gap-3" data-id="element-1043">
                          <div className="relative" data-id="element-1044">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${log.color}`} data-id="element-1045">
                              <log.icon size={14} data-id="element-1046" />
                            </div>
                            {i < activityLog.length - 1 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-100 -z-0" data-id="element-1047" />}
                          </div>
                          <div className="pt-1" data-id="element-1048">
                            <p className="text-xs text-gray-400 mb-0.5" data-id="element-1049">
                              {log.date}
                            </p>
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-1050">
                              {log.text}
                            </p>
                          </div>
                        </div>)}
                    </div>
                  </div>
                </motion.div> : <motion.div key="preview" initial={{
            opacity: 0,
            x: 15
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 15
          }} transition={{
            duration: 0.2
          }} className="p-5" data-id="element-1051">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative" data-id="element-1052">
                    {/* VOID Watermark */}
                    {isVoided && <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden" data-id="element-1053">
                        <div className="transform -rotate-45 border-4 border-red-500/30 text-red-500/30 text-6xl font-black px-8 py-4 rounded-xl uppercase tracking-widest" data-id="element-1054">
                          VOID
                        </div>
                      </div>}

                    {/* Invoice Document */}
                    <div className={cn('p-6', isVoided && 'opacity-50 grayscale-[0.5]')} data-id="element-1055">
                      {/* Top: Logo + Invoice label */}
                      <div className="flex justify-between items-start mb-8" data-id="element-1056">
                        <div className="flex items-center gap-2.5" data-id="element-1057">
                          <div className="w-10 h-10 bg-trustopay-purple rounded-xl flex items-center justify-center" data-id="element-1058">
                            <span className="text-white font-bold text-sm" data-id="element-1059">
                              TP
                            </span>
                          </div>
                          <div data-id="element-1060">
                            <p className="font-bold text-trustopay-navy text-sm" data-id="element-1061">
                              Trustopay
                            </p>
                            <p className="text-[10px] text-gray-400" data-id="element-1062">
                              trustopay.com
                            </p>
                          </div>
                        </div>
                        <div className="text-right" data-id="element-1063">
                          <h3 className="text-xl font-bold text-trustopay-navy tracking-tight" data-id="element-1064">
                            INVOICE
                          </h3>
                          <p className="text-xs text-gray-400 font-medium" data-id="element-1065">
                            {localInvoice.number}
                          </p>
                        </div>
                      </div>

                      {/* From / To */}
                      <div className="grid grid-cols-2 gap-6 mb-8" data-id="element-1066">
                        <div data-id="element-1067">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-1068">
                            From
                          </p>
                          <p className="font-bold text-trustopay-navy text-sm" data-id="element-1069">
                            Arjun Mehta
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1070">
                            arjun@trustopay.com
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1071">
                            +91 98765 43210
                          </p>
                          <p className="text-xs text-gray-400 mt-1" data-id="element-1072">
                            Gujarat, India
                          </p>
                        </div>
                        <div data-id="element-1073">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-1074">
                            Bill To
                          </p>
                          <p className="font-bold text-trustopay-navy text-sm" data-id="element-1075">
                            {localInvoice.client}
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1076">
                            client@example.com
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1077">
                            +91 91234 56789
                          </p>
                          <p className="text-xs text-gray-400 mt-1" data-id="element-1078">
                            Mumbai, India
                          </p>
                        </div>
                      </div>

                      {/* Dates row */}
                      <div className="flex gap-4 mb-6" data-id="element-1079">
                        <div className="flex-1 bg-gray-50 rounded-lg p-3" data-id="element-1080">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-1081">
                            Issue Date
                          </p>
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-1082">
                            {invoiceDate}
                          </p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3" data-id="element-1083">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-1084">
                            Due Date
                          </p>
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-1085">
                            {dueDate}
                          </p>
                        </div>
                        <div className="flex-1 bg-purple-50 rounded-lg p-3" data-id="element-1086">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-1087">
                            Status
                          </p>
                          <p className={`text-sm font-bold capitalize ${localInvoice.status === 'paid' ? 'text-green-600' : localInvoice.status === 'overdue' ? 'text-red-500' : 'text-orange-500'}`} data-id="element-1088">
                            {localInvoice.status}
                          </p>
                        </div>
                      </div>

                      {/* Items Table */}
                      <div className="mb-6" data-id="element-1089">
                        <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-trustopay-navy mb-3" data-id="element-1090">
                          <p className="col-span-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-1091">
                            Description
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center" data-id="element-1092">
                            Qty
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right" data-id="element-1093">
                            Rate
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right" data-id="element-1094">
                            Amount
                          </p>
                        </div>
                        <div className="grid grid-cols-12 gap-2 py-2.5 border-b border-gray-100" data-id="element-1095">
                          <div className="col-span-6" data-id="element-1096">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-1097">
                              Web Design Services
                            </p>
                            <p className="text-[10px] text-gray-400" data-id="element-1098">
                              Professional website design & development
                            </p>
                          </div>
                          <p className="col-span-2 text-sm text-gray-600 text-center" data-id="element-1099">
                            1
                          </p>
                          <p className="col-span-2 text-sm text-gray-600 text-right" data-id="element-1100">
                            {formatINR(subtotal)}
                          </p>
                          <p className="col-span-2 text-sm font-medium text-trustopay-navy text-right" data-id="element-1101">
                            {formatINR(subtotal)}
                          </p>
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="flex justify-end" data-id="element-1102">
                        <div className="w-48 space-y-2" data-id="element-1103">
                          <div className="flex justify-between text-sm" data-id="element-1104">
                            <span className="text-gray-500" data-id="element-1105">Subtotal</span>
                            <span className="text-gray-700" data-id="element-1106">
                              {formatINR(subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm" data-id="element-1107">
                            <span className="text-gray-500" data-id="element-1108">CGST (9%)</span>
                            <span className="text-gray-700" data-id="element-1109">
                              {formatINR(gst / 2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm" data-id="element-1110">
                            <span className="text-gray-500" data-id="element-1111">SGST (9%)</span>
                            <span className="text-gray-700" data-id="element-1112">
                              {formatINR(gst / 2)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-trustopay-navy pt-2 border-t-2 border-trustopay-navy" data-id="element-1113">
                            <span data-id="element-1114">Total</span>
                            <span data-id="element-1115">{formatINR(localInvoice.amount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount in Words */}
                      <div className="mt-4 bg-gray-50 rounded-lg p-3" data-id="element-1116">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-1117">
                          Amount in Words
                        </p>
                        <p className="text-xs font-medium text-trustopay-navy italic" data-id="element-1118">
                          {localInvoice.amount >= 100000 ? `${Math.floor(localInvoice.amount / 100000)} Lakh ${Math.floor(localInvoice.amount % 100000 / 1000)} Thousand Rupees Only` : localInvoice.amount >= 1000 ? `${Math.floor(localInvoice.amount / 1000)} Thousand ${localInvoice.amount % 1000 > 0 ? `${localInvoice.amount % 1000} ` : ''}Rupees Only` : `${localInvoice.amount} Rupees Only`}
                        </p>
                      </div>

                      {/* Payment Information Section */}
                      <div className="mt-6 border-t-2 border-gray-200 pt-4" data-id="element-1119">
                        <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3" data-id="element-1120">
                          <p className="text-xs font-bold text-trustopay-navy uppercase tracking-wider" data-id="element-1121">
                            Payment Information
                          </p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 space-y-4" data-id="element-1122">
                          {/* Bank Transfer */}
                          <div data-id="element-1123">
                            <p className="text-[11px] font-bold text-gray-600 mb-2" data-id="element-1124">
                              Bank Transfer:
                            </p>
                            <div className="space-y-1.5 text-xs" data-id="element-1125">
                              <div className="flex" data-id="element-1126">
                                <span className="text-gray-400 w-28 flex-shrink-0" data-id="element-1127">
                                  Account Name
                                </span>
                                <span className="font-medium text-trustopay-navy" data-id="element-1128">
                                  Arjun Mehta
                                </span>
                              </div>
                              <div className="flex" data-id="element-1129">
                                <span className="text-gray-400 w-28 flex-shrink-0" data-id="element-1130">
                                  Account No.
                                </span>
                                <span className="font-mono font-medium text-trustopay-navy" data-id="element-1131">
                                  1234 5678 9012 3456
                                </span>
                              </div>
                              <div className="flex" data-id="element-1132">
                                <span className="text-gray-400 w-28 flex-shrink-0" data-id="element-1133">
                                  IFSC Code
                                </span>
                                <span className="font-mono font-medium text-trustopay-navy" data-id="element-1134">
                                  SBIN0001234
                                </span>
                              </div>
                              <div className="flex" data-id="element-1135">
                                <span className="text-gray-400 w-28 flex-shrink-0" data-id="element-1136">
                                  Bank
                                </span>
                                <span className="font-medium text-trustopay-navy" data-id="element-1137">
                                  State Bank of India
                                </span>
                              </div>
                              <div className="flex" data-id="element-1138">
                                <span className="text-gray-400 w-28 flex-shrink-0" data-id="element-1139">
                                  Branch
                                </span>
                                <span className="text-gray-500" data-id="element-1140">
                                  Alkapuri, Vadodara
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-gray-100" data-id="element-1141" />

                          {/* UPI */}
                          <div data-id="element-1142">
                            <p className="text-[11px] font-bold text-gray-600 mb-2" data-id="element-1143">
                              OR Pay via UPI:
                            </p>
                            <div className="flex items-center gap-2" data-id="element-1144">
                              <span className="text-xs text-gray-400" data-id="element-1145">
                                UPI ID:
                              </span>
                              <span className="font-mono text-xs font-medium text-trustopay-purple" data-id="element-1146">
                                arjun@paytm
                              </span>
                            </div>
                          </div>

                          <div className="h-px bg-gray-100" data-id="element-1147" />

                          {/* QR Code */}
                          <div data-id="element-1148">
                            <p className="text-[11px] font-bold text-gray-600 mb-2" data-id="element-1149">
                              OR Scan & Pay:
                            </p>
                            <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-lg p-1.5 flex items-center justify-center" data-id="element-1150">
                              <div className="w-full h-full grid grid-cols-8 gap-px" data-id="element-1151">
                                {Array.from({
                            length: 64
                          }).map((_, i) => <div key={i} className={cn('rounded-[1px]', i < 16 && i % 8 < 2 || i < 16 && i % 8 > 5 || i > 47 && i % 8 < 2 || Math.random() > 0.5 ? 'bg-trustopay-navy' : 'bg-transparent')} data-id="element-1152" />)}
                              </div>
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1" data-id="element-1153">
                              Scan to pay {formatINR(localInvoice.amount)}
                            </p>
                          </div>

                          <div className="h-px bg-gray-100" data-id="element-1154" />

                          {/* Payment Link */}
                          <div data-id="element-1155">
                            <p className="text-[11px] font-bold text-gray-600 mb-1" data-id="element-1156">
                              Payment Link:
                            </p>
                            <p className="text-[10px] text-trustopay-purple font-medium break-all" data-id="element-1157">
                              https://pay.trustopay.app/inv/
                              {localInvoice.number?.toLowerCase() || 'inv-045'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2 px-1" data-id="element-1158">
                          <Lock size={10} className="text-gray-400" data-id="element-1159" />
                          <p className="text-[9px] text-gray-400" data-id="element-1160">
                            Payment information is verified and secure.
                          </p>
                        </div>
                      </div>

                      {/* Terms & Conditions */}
                      <div className="mt-6 border-t border-gray-200 pt-4" data-id="element-1161">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-1162">
                          Terms & Conditions
                        </p>
                        <ul className="space-y-1 text-[10px] text-gray-500 list-disc pl-3" data-id="element-1163">
                          <li data-id="element-1164">Payment due within 30 days of invoice date</li>
                          <li data-id="element-1165">Late payments subject to 2% monthly interest</li>
                          <li data-id="element-1166">Please reference invoice number with payment</li>
                        </ul>
                      </div>

                      {/* Notes */}
                      <div className="mt-4 border-t border-gray-100 pt-3" data-id="element-1167">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1" data-id="element-1168">
                          Notes
                        </p>
                        <p className="text-[10px] text-gray-500" data-id="element-1169">
                          Thank you for your business!
                        </p>
                      </div>

                      {/* Authorized Signature */}
                      <div className="mt-6 border-t border-gray-200 pt-4" data-id="element-1170">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3" data-id="element-1171">
                          Authorized Signature
                        </p>
                        <div className="h-12 border-b border-gray-300 mb-2 flex items-end" data-id="element-1172">
                          <p className="text-lg font-serif italic text-gray-400 pb-1" data-id="element-1173">
                            Arjun Mehta
                          </p>
                        </div>
                        <p className="text-xs font-medium text-trustopay-navy" data-id="element-1174">
                          Arjun Mehta
                        </p>
                        <p className="text-[10px] text-gray-400" data-id="element-1175">
                          {invoiceDate}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="mt-6 text-center pt-4 border-t border-gray-100" data-id="element-1176">
                        <p className="text-[10px] text-gray-400" data-id="element-1177">
                          Generated by{' '}
                          <span className="font-medium text-trustopay-purple" data-id="element-1178">
                            Trustopay
                          </span>
                        </p>
                        <p className="text-[9px] text-gray-300 mt-0.5" data-id="element-1179">
                          www.trustopay.com
                        </p>
                        <p className="text-[9px] text-gray-300 mt-1" data-id="element-1180">
                          ⚡ Made with ❤️ in Gujarat
                        </p>
                      </div>

                      {/* Footer stripe */}
                      <div className="h-1.5 bg-gradient-to-r from-trustopay-purple via-purple-400 to-trustopay-purple mt-6" data-id="element-1181" />
                    </div>
                  </div>

                  {/* Download button below preview */}
                  <div className="mt-4 flex gap-3" data-id="element-1182">
                    <Button variant="outline" className="flex-1 gap-2" data-id="element-1183">
                      <FileDown size={18} data-id="element-1184" /> Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" data-id="element-1185">
                      <Share2 size={18} data-id="element-1186" /> Share
                    </Button>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0" data-id="element-1187">
            {isSent && (isPending || localInvoice.status === 'overdue') ? <div className="flex gap-3" data-id="element-1188">
                <Button variant="outline" className="flex-1" data-id="element-1189">
                  Send Reminder
                </Button>
                <Button variant="outline" className="flex-1 gap-2" data-id="element-1190">
                  <FileDown size={18} data-id="element-1191" /> Download PDF
                </Button>
              </div> : localInvoice.type === 'received' && !isPaid ? <div className="flex gap-3" data-id="element-1192">
                <Button variant="outline" className="flex-1 gap-2" data-id="element-1193">
                  <FileDown size={18} data-id="element-1194" /> Download PDF
                </Button>
                <Button className="flex-1" data-id="element-1195">Pay Now</Button>
              </div> : isPaid ? <div className="flex gap-3" data-id="element-1196">
                <Button variant="outline" className="flex-1 gap-2" data-id="element-1197">
                  <FileDown size={18} data-id="element-1198" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1 gap-2" data-id="element-1199">
                  <Share2 size={18} data-id="element-1200" /> Share Receipt
                </Button>
              </div> : <Button variant="outline" className="w-full gap-2" data-id="element-1201">
                <FileDown size={18} data-id="element-1202" /> Download PDF
              </Button>}
          </div>

          {/* ACTION MENU BOTTOM SHEET */}
          <AnimatePresence data-id="element-1203">
            {showActionMenu && <>
                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowActionMenu(false)} data-id="element-1204" />
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
          }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] max-w-[430px] mx-auto overflow-hidden" data-id="element-1205">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center" data-id="element-1206">
                    <h3 className="font-bold text-trustopay-navy" data-id="element-1207">
                      Invoice Actions
                    </h3>
                    <button onClick={() => setShowActionMenu(false)} className="p-1 bg-gray-100 rounded-full" data-id="element-1208">
                      <X size={16} data-id="element-1209" />
                    </button>
                  </div>
                  <div className="p-2" data-id="element-1210">
                    {/* EDIT */}
                    {!isVoided && <button onClick={handleEdit} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-1211">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600" data-id="element-1212">
                          <Edit2 size={20} data-id="element-1213" />
                        </div>
                        <div data-id="element-1214">
                          <p className="font-bold text-trustopay-navy" data-id="element-1215">
                            Edit Invoice
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1216">
                            Modify details or correct errors
                          </p>
                        </div>
                      </button>}

                    {/* DUPLICATE */}
                    <button onClick={handleDuplicate} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-1217">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-trustopay-purple" data-id="element-1218">
                        <Copy size={20} data-id="element-1219" />
                      </div>
                      <div data-id="element-1220">
                        <p className="font-bold text-trustopay-navy" data-id="element-1221">
                          Duplicate Invoice
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-1222">
                          Create a copy as a new draft
                        </p>
                      </div>
                    </button>

                    {/* VOID / DELETE */}
                    {!isVoided && <button onClick={isDraft ? handleDelete : handleVoid} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 rounded-xl text-left" data-id="element-1223">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" data-id="element-1224">
                          {isDraft ? <Trash2 size={20} data-id="element-1225" /> : <XCircle size={20} data-id="element-1226" />}
                        </div>
                        <div data-id="element-1227">
                          <p className="font-bold text-red-600" data-id="element-1228">
                            {isDraft ? 'Delete Draft' : 'Void Invoice'}
                          </p>
                          <p className="text-xs text-red-400" data-id="element-1229">
                            {isDraft ? 'Permanently remove this draft' : 'Cancel this invoice'}
                          </p>
                        </div>
                      </button>}

                    {/* DOWNLOAD (if not draft) */}
                    {!isDraft && <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-1230">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" data-id="element-1231">
                          <FileDown size={20} data-id="element-1232" />
                        </div>
                        <div data-id="element-1233">
                          <p className="font-bold text-trustopay-navy" data-id="element-1234">
                            Download PDF
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-1235">
                            Save invoice file
                          </p>
                        </div>
                      </button>}
                  </div>
                </motion.div>
              </>}
          </AnimatePresence>

          {/* EDIT WARNING MODAL (Sent) */}
          <AnimatePresence data-id="element-1236">
            {showEditWarning && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1237">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1238">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1239">
                    <AlertTriangle size={24} className="text-amber-600" data-id="element-1240" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1241">
                    Edit Sent Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4" data-id="element-1242">
                    This invoice has been sent to the client. You can only edit
                    dates and notes. To change amounts, please void this invoice
                    and create a new one.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs space-y-2" data-id="element-1243">
                    <div className="flex items-center gap-2 text-green-600" data-id="element-1244">
                      <Check size={12} data-id="element-1245" /> Due date, Notes, Terms
                    </div>
                    <div className="flex items-center gap-2 text-red-500" data-id="element-1246">
                      <X size={12} data-id="element-1247" /> Amount, Items, Client
                    </div>
                  </div>
                  <div className="flex gap-3" data-id="element-1248">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditWarning(false)} data-id="element-1249">
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => {
                setShowEditWarning(false);
                showToast('success', 'Editing enabled for dates & notes');
              }} data-id="element-1250">
                      Continue Editing
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* EDIT ERROR MODAL (Paid) */}
          <AnimatePresence data-id="element-1251">
            {showEditError && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1252">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1253">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1254">
                    <XCircle size={24} className="text-red-600" data-id="element-1255" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1256">
                    Cannot Edit Paid Invoice
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-1257">
                    This invoice has been paid and cannot be edited. You can
                    void it and issue a refund, or create a new invoice for
                    adjustments.
                  </p>
                  <div className="flex flex-col gap-3" data-id="element-1258">
                    <Button className="w-full" onClick={() => {
                setShowEditError(false);
                handleDuplicate();
              }} data-id="element-1259">
                      Duplicate & Create New
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                setShowEditError(false);
                handleVoid();
              }} data-id="element-1260">
                      Void & Refund
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={() => setShowEditError(false)} data-id="element-1261">
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* DELETE CONFIRM MODAL (Draft) */}
          <AnimatePresence data-id="element-1262">
            {showDeleteConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1263">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1264">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1265">
                    <Trash2 size={24} className="text-red-600" data-id="element-1266" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1267">
                    Delete Draft Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-1268">
                    Are you sure you want to delete this draft? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3" data-id="element-1269">
                    <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)} data-id="element-1270">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmDelete} data-id="element-1271">
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* DELETE ERROR MODAL (Sent) */}
          <AnimatePresence data-id="element-1272">
            {showDeleteError && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1273">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1274">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1275">
                    <XCircle size={24} className="text-red-600" data-id="element-1276" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1277">
                    Cannot Delete Sent Invoice
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-1278">
                    This invoice has been sent and cannot be deleted for audit
                    trail purposes. You can void it instead.
                  </p>
                  <div className="flex gap-3" data-id="element-1279">
                    <Button variant="outline" className="flex-1" onClick={() => setShowDeleteError(false)} data-id="element-1280">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                setShowDeleteError(false);
                handleVoid();
              }} data-id="element-1281">
                      Void Invoice
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* VOID CONFIRM MODAL */}
          <AnimatePresence data-id="element-1282">
            {showVoidConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1283">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1284">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1285">
                    <AlertTriangle size={24} className="text-red-600" data-id="element-1286" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1287">
                    Void Invoice?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4" data-id="element-1288">
                    This will mark the invoice as cancelled and notify the
                    client. This action cannot be undone.
                  </p>
                  <div className="mb-6" data-id="element-1289">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block" data-id="element-1290">
                      Reason (Optional)
                    </label>
                    <Input placeholder="e.g. Cancelled by client" value={voidReason} onChange={e => setVoidReason(e.target.value)} data-id="element-1291" />
                  </div>
                  <div className="flex gap-3" data-id="element-1292">
                    <Button variant="outline" className="flex-1" onClick={() => setShowVoidConfirm(false)} data-id="element-1293">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmVoid} data-id="element-1294">
                      Void Invoice
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* VOID PAID WARNING MODAL */}
          <AnimatePresence data-id="element-1295">
            {showVoidPaidWarning && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-1296">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-1297">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-1298">
                    <AlertTriangle size={24} className="text-amber-600" data-id="element-1299" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-1300">
                    Invoice Already Paid
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-1301">
                    This invoice has been paid. Voiding it requires issuing a
                    refund. Have you issued a refund?
                  </p>

                  <div className="space-y-3 mb-6" data-id="element-1302">
                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50" data-id="element-1303">
                      <input type="radio" name="refund" className="w-4 h-4 text-trustopay-purple" onChange={() => setRefundIssued('yes')} data-id="element-1304" />
                      <span className="text-sm font-medium text-trustopay-navy" data-id="element-1305">
                        Yes, refund completed
                      </span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50" data-id="element-1306">
                      <input type="radio" name="refund" className="w-4 h-4 text-trustopay-purple" onChange={() => setRefundIssued('no')} data-id="element-1307" />
                      <span className="text-sm font-medium text-trustopay-navy" data-id="element-1308">
                        No, will refund later
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3" data-id="element-1309">
                    <Button variant="outline" className="flex-1" onClick={() => setShowVoidPaidWarning(false)} data-id="element-1310">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" disabled={!refundIssued} onClick={confirmVoid} data-id="element-1311">
                      Void & Refund
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>
        </motion.div>}
    </AnimatePresence>;
}