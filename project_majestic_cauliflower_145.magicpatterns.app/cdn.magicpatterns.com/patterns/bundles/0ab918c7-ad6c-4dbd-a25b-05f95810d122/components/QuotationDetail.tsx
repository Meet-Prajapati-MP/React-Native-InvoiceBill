import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Share2, FileText, Eye, CheckCircle2, FileDown, Edit2, Trash2, Send, XCircle, Check, X, ClipboardList, MoreVertical, Copy, AlertTriangle, AlertCircle, History, Activity, ChevronDown, ChevronUp, Link2, Mail, MessageCircle, CheckCheck, Info, Lightbulb, Phone, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { StatusBadge } from './StatusBadge';
import { formatINR, cn } from '../lib/utils';
interface QuotationDetailProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  onConvertToInvoice: () => void;
}
export function QuotationDetail({
  isOpen,
  onClose,
  quote,
  onConvertToInvoice
}: QuotationDetailProps) {
  const [activeView, setActiveView] = useState<'details' | 'preview'>('details');
  const [localQuote, setLocalQuote] = useState<any>(quote);
  // Modal States
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showEditWarning, setShowEditWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  // Form States
  const [withdrawReason, setWithdrawReason] = useState('');
  // UI States
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [dismissedPrivacyNotice, setDismissedPrivacyNotice] = useState(false);
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  useEffect(() => {
    setLocalQuote(quote);
    setDismissedPrivacyNotice(false);
  }, [quote]);
  if (!localQuote) return null;
  const isSent = localQuote.type === 'sent';
  const isDraft = localQuote.status === 'draft';
  const isAccepted = localQuote.status === 'accepted';
  const isRejected = localQuote.status === 'rejected';
  const isExpired = localQuote.status === 'expired';
  const isConverted = localQuote.status === 'converted';
  const isWithdrawn = localQuote.status === 'voided';
  const isSentStatus = localQuote.status === 'sent';
  const isTerminal = isAccepted || isRejected || isExpired || isConverted || isWithdrawn;
  const subtotal = localQuote.amount * 0.85;
  const gst = localQuote.amount * 0.15;
  const showToastMsg = (type: 'success' | 'error', message: string) => {
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
      showToastMsg('success', 'Opening edit mode...');
    } else if (isSentStatus) {
      setShowEditWarning(true);
    } else {
      showToastMsg('error', 'This quotation cannot be edited.');
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
  const handleWithdraw = () => {
    setShowActionMenu(false);
    setShowWithdrawConfirm(true);
  };
  const handleDuplicate = () => {
    setShowActionMenu(false);
    showToastMsg('success', `Quotation duplicated as QUO-${String(Math.floor(Math.random() * 900) + 100)} (Draft)`);
  };
  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    showToastMsg('success', 'Draft deleted successfully');
    setTimeout(onClose, 1500);
  };
  const confirmWithdraw = () => {
    setShowWithdrawConfirm(false);
    setLocalQuote({
      ...localQuote,
      status: 'voided'
    });
    showToastMsg('success', 'Quotation withdrawn. Client has been notified.');
  };
  // Mock Data
  const activityLog = [{
    date: 'Feb 8, 4:00 PM',
    icon: Eye,
    text: 'Quotation viewed (3rd time)',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 7, 9:00 AM',
    icon: Eye,
    text: 'Quotation viewed via email link',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 6, 10:30 AM',
    icon: Eye,
    text: 'Quotation viewed for first time',
    color: 'bg-blue-100 text-blue-600'
  }, {
    date: 'Feb 5, 3:45 PM',
    icon: CheckCheck,
    text: 'WhatsApp read by client',
    color: 'bg-green-100 text-green-600'
  }, {
    date: 'Feb 5, 2:15 PM',
    icon: Send,
    text: 'Quotation delivered (Email + WhatsApp)',
    color: 'bg-gray-100 text-gray-600'
  }, {
    date: 'Feb 5, 2:00 PM',
    icon: FileText,
    text: 'Quotation created',
    color: 'bg-gray-100 text-gray-600'
  }];
  const versionHistory = [{
    version: 'v2',
    date: 'Feb 8, 2026, 10:00 AM',
    changes: ['Changed: Payment terms updated']
  }, {
    version: 'v1',
    date: 'Feb 5, 2026, 2:00 PM',
    changes: ['Original Version']
  }];
  return <AnimatePresence data-id="element-1998">
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
    }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-1999">
          {/* Toast */}
          <AnimatePresence data-id="element-2000">
            {toast && <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className={cn('absolute top-4 left-4 right-4 z-[60] p-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-white', toast.type === 'success' ? 'bg-green-600' : 'bg-red-600')} data-id="element-2001">
                {toast.type === 'success' ? <CheckCircle2 size={16} data-id="element-2002" /> : <AlertCircle size={16} data-id="element-2003" />}
                {toast.message}
              </motion.div>}
          </AnimatePresence>

          {/* Header */}
          <div className="bg-white border-b border-gray-100 sticky top-0 z-10" data-id="element-2004">
            <div className="p-4 flex items-center justify-between" data-id="element-2005">
              <div className="flex items-center" data-id="element-2006">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-2007">
                  <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-2008" />
                </button>
                <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-2009">
                  Quotation
                </h2>
              </div>
              <div className="flex gap-1" data-id="element-2010">
                <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2011">
                  <Share2 size={20} data-id="element-2012" />
                </button>
                <button onClick={() => setShowActionMenu(true)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-2013">
                  <MoreVertical size={20} data-id="element-2014" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 relative" data-id="element-2015">
              <button onClick={() => setActiveView('details')} className={`flex-1 pb-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeView === 'details' ? 'text-trustopay-purple' : 'text-gray-400'}`} data-id="element-2016">
                <FileText size={15} data-id="element-2017" /> Details
              </button>
              <button onClick={() => setActiveView('preview')} className={`flex-1 pb-3 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${activeView === 'preview' ? 'text-trustopay-purple' : 'text-gray-400'}`} data-id="element-2018">
                <Eye size={15} data-id="element-2019" /> Preview
              </button>
              <motion.div className="absolute bottom-0 h-0.5 bg-trustopay-purple" initial={false} animate={{
            left: activeView === 'details' ? '0%' : '50%',
            width: '50%'
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }} data-id="element-2020" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pb-28" data-id="element-2021">
            <AnimatePresence mode="wait" data-id="element-2022">
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
          }} className="p-5 space-y-4" data-id="element-2023">
                  {/* Buyer Privacy Notice */}
                  {!isSent && !dismissedPrivacyNotice && <motion.div initial={{
              opacity: 0,
              y: -8
            }} animate={{
              opacity: 1,
              y: 0
            }} className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2" data-id="element-2024">
                      <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" data-id="element-2025" />
                      <p className="text-xs text-blue-700 flex-1" data-id="element-2026">
                        The sender will be notified that you viewed this
                        quotation.
                      </p>
                      <button onClick={() => setDismissedPrivacyNotice(true)} className="text-blue-400 hover:text-blue-600 flex-shrink-0" data-id="element-2027">
                        <X size={14} data-id="element-2028" />
                      </button>
                    </motion.div>}

                  {/* Quote Header Card */}
                  <Card className="p-5" data-id="element-2029">
                    <div className="flex items-center gap-2 mb-3" data-id="element-2030">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center" data-id="element-2031">
                        <ClipboardList size={16} className="text-teal-600" data-id="element-2032" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600" data-id="element-2033">
                        {isSent ? 'Quote Sent' : 'Quote Received'}
                      </span>
                      <div className="ml-auto" data-id="element-2034">
                        <StatusBadge status={localQuote.status} data-id="element-2035" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-trustopay-navy mb-3" data-id="element-2036">
                      {formatINR(localQuote.amount)}
                    </h1>
                    <div className="flex justify-between text-sm" data-id="element-2037">
                      <div data-id="element-2038">
                        <p className="text-gray-400 text-xs" data-id="element-2039">Quote No</p>
                        <p className="font-medium text-trustopay-navy" data-id="element-2040">
                          {localQuote.id}
                        </p>
                      </div>
                      <div className="text-right" data-id="element-2041">
                        <p className="text-gray-400 text-xs" data-id="element-2042">Valid Until</p>
                        <p className="font-medium text-trustopay-navy" data-id="element-2043">
                          {localQuote.validUntil}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Status Timeline */}
                  <Card className="p-5" data-id="element-2044">
                    <h3 className="font-bold text-trustopay-navy mb-4" data-id="element-2045">
                      Status History
                    </h3>
                    <div className="relative pl-2" data-id="element-2046">
                      <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-100" data-id="element-2047" />
                      <div className="space-y-6" data-id="element-2048">
                        <div className="relative flex items-start gap-4" data-id="element-2049">
                          <div className="relative z-10 w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 mt-0.5 flex items-center justify-center" data-id="element-2050">
                            <CheckCircle2 size={10} className="text-white" data-id="element-2051" />
                          </div>
                          <div data-id="element-2052">
                            <p className="font-medium text-trustopay-navy text-sm" data-id="element-2053">
                              Created
                            </p>
                            <p className="text-[11px] text-gray-400" data-id="element-2054">
                              {localQuote.date}
                            </p>
                          </div>
                        </div>
                        {['sent', 'accepted', 'rejected', 'converted', 'voided'].includes(localQuote.status) && <div className="relative flex items-start gap-4" data-id="element-2055">
                            <div className="relative z-10 w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 mt-0.5 flex items-center justify-center" data-id="element-2056">
                              <CheckCircle2 size={10} className="text-white" data-id="element-2057" />
                            </div>
                            <div data-id="element-2058">
                              <p className="font-medium text-trustopay-navy text-sm" data-id="element-2059">
                                Sent to Client
                              </p>
                              <p className="text-[11px] text-gray-400" data-id="element-2060">
                                {localQuote.date}
                              </p>
                            </div>
                          </div>}
                        {isAccepted && <div className="relative flex items-start gap-4" data-id="element-2061">
                            <div className="relative z-10 w-4 h-4 rounded-full bg-green-500 border-2 border-green-500 mt-0.5 flex items-center justify-center" data-id="element-2062">
                              <CheckCircle2 size={10} className="text-white" data-id="element-2063" />
                            </div>
                            <div data-id="element-2064">
                              <p className="font-medium text-trustopay-navy text-sm" data-id="element-2065">
                                Accepted by Client
                              </p>
                              <p className="text-[11px] text-gray-400" data-id="element-2066">
                                Oct 21, 2023
                              </p>
                            </div>
                          </div>}
                        {isConverted && <div className="relative flex items-start gap-4" data-id="element-2067">
                            <div className="relative z-10 w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-500 mt-0.5 flex items-center justify-center" data-id="element-2068">
                              <CheckCircle2 size={10} className="text-white" data-id="element-2069" />
                            </div>
                            <div data-id="element-2070">
                              <p className="font-medium text-trustopay-navy text-sm" data-id="element-2071">
                                Converted to Invoice
                              </p>
                              <p className="text-[11px] text-gray-400" data-id="element-2072">
                                Oct 22, 2023
                              </p>
                            </div>
                          </div>}
                        {isWithdrawn && <div className="relative flex items-start gap-4" data-id="element-2073">
                            <div className="relative z-10 w-4 h-4 rounded-full bg-red-500 border-2 border-red-500 mt-0.5 flex items-center justify-center" data-id="element-2074">
                              <XCircle size={10} className="text-white" data-id="element-2075" />
                            </div>
                            <div data-id="element-2076">
                              <p className="font-medium text-red-600 text-sm" data-id="element-2077">
                                Withdrawn
                              </p>
                              <p className="text-[11px] text-gray-400" data-id="element-2078">
                                Feb 10, 2026
                              </p>
                            </div>
                          </div>}
                      </div>
                    </div>
                  </Card>

                  {/* Parties */}
                  <Card className="p-0 overflow-hidden" data-id="element-2079">
                    <div className="p-4 border-b border-gray-100" data-id="element-2080">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2" data-id="element-2081">
                        Quoted To
                      </p>
                      <div className="flex items-center gap-3" data-id="element-2082">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold" data-id="element-2083">
                          {localQuote.client?.charAt(0) || 'C'}
                        </div>
                        <div data-id="element-2084">
                          <p className="font-bold text-trustopay-navy" data-id="element-2085">
                            {localQuote.client}
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2086">
                            client@example.com
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4" data-id="element-2087">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-2" data-id="element-2088">
                        From
                      </p>
                      <div className="flex items-center gap-3" data-id="element-2089">
                        <div className="w-10 h-10 rounded-full bg-trustopay-navy text-white flex items-center justify-center font-bold" data-id="element-2090">
                          A
                        </div>
                        <div data-id="element-2091">
                          <p className="font-bold text-trustopay-navy" data-id="element-2092">
                            Arjun Mehta
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2093">
                            arjun@trustopay.com
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Items */}
                  <Card className="p-4" data-id="element-2094">
                    <h3 className="font-bold text-trustopay-navy mb-4" data-id="element-2095">
                      Items
                    </h3>
                    <div className="space-y-3" data-id="element-2096">
                      <div className="flex justify-between items-start text-sm" data-id="element-2097">
                        <div data-id="element-2098">
                          <p className="font-medium text-trustopay-navy" data-id="element-2099">
                            Web Design Services
                          </p>
                          <p className="text-gray-500" data-id="element-2100">
                            1 x {formatINR(subtotal)}
                          </p>
                        </div>
                        <p className="font-medium text-trustopay-navy" data-id="element-2101">
                          {formatINR(subtotal)}
                        </p>
                      </div>
                      <div className="h-px bg-gray-100" data-id="element-2102" />
                      <div className="flex justify-between text-sm" data-id="element-2103">
                        <span className="text-gray-500" data-id="element-2104">Subtotal</span>
                        <span data-id="element-2105">{formatINR(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm" data-id="element-2106">
                        <span className="text-gray-500" data-id="element-2107">GST (18%)</span>
                        <span data-id="element-2108">{formatINR(gst)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-trustopay-navy pt-2 border-t border-gray-100" data-id="element-2109">
                        <span data-id="element-2110">Total</span>
                        <span data-id="element-2111">{formatINR(localQuote.amount)}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Delivery & Activity Tracking (Seller View Only) */}
                  {isSent && !isDraft && <Card className="p-5 space-y-5" data-id="element-2112">
                      <div className="flex items-center justify-between" data-id="element-2113">
                        <h3 className="font-bold text-trustopay-navy flex items-center gap-2" data-id="element-2114">
                          <Activity size={16} className="text-teal-600" data-id="element-2115" />
                          Delivery & Activity
                        </h3>
                      </div>

                      {/* Sent Via Channels */}
                      <div className="space-y-3" data-id="element-2116">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2117">
                          Sent via
                        </p>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-id="element-2118">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0" data-id="element-2119">
                            <Mail size={14} className="text-blue-600" data-id="element-2120" />
                          </div>
                          <div className="flex-1 min-w-0" data-id="element-2121">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-2122">
                              Email
                            </p>
                            <p className="text-[11px] text-gray-500 truncate" data-id="element-2123">
                              tech@solutions.com
                            </p>
                            <div className="mt-1.5 space-y-1" data-id="element-2124">
                              <div className="flex items-center gap-1.5" data-id="element-2125">
                                <Check size={10} className="text-green-500" data-id="element-2126" />
                                <span className="text-[10px] text-gray-400" data-id="element-2127">
                                  Delivered on Feb 5, 2:15 PM
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5" data-id="element-2128">
                                <Eye size={10} className="text-blue-500" data-id="element-2129" />
                                <span className="text-[10px] text-blue-600 font-medium" data-id="element-2130">
                                  Opened on Feb 6, 10:30 AM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg" data-id="element-2131">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0" data-id="element-2132">
                            <MessageCircle size={14} className="text-green-600" data-id="element-2133" />
                          </div>
                          <div className="flex-1 min-w-0" data-id="element-2134">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-2135">
                              WhatsApp
                            </p>
                            <p className="text-[11px] text-gray-500" data-id="element-2136">
                              +91 98765 43210
                            </p>
                            <div className="mt-1.5 space-y-1" data-id="element-2137">
                              <div className="flex items-center gap-1.5" data-id="element-2138">
                                <Check size={10} className="text-green-500" data-id="element-2139" />
                                <span className="text-[10px] text-gray-400" data-id="element-2140">
                                  Delivered on Feb 5, 2:15 PM
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5" data-id="element-2141">
                                <CheckCheck size={10} className="text-blue-500" data-id="element-2142" />
                                <span className="text-[10px] text-blue-600 font-medium" data-id="element-2143">
                                  Read on Feb 5, 3:45 PM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" data-id="element-2144" />

                      {/* Quotation Views */}
                      <div className="space-y-2" data-id="element-2145">
                        <div className="flex items-center justify-between" data-id="element-2146">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2147">
                            Quotation Views
                          </p>
                          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-1" data-id="element-2148">
                            <Eye size={10} data-id="element-2149" /> 3 views
                          </span>
                        </div>
                        <div className="space-y-1.5 pl-1" data-id="element-2150">
                          {[{
                    time: 'Feb 6, 10:30 AM',
                    source: 'In-app'
                  }, {
                    time: 'Feb 7, 9:00 AM',
                    source: 'Email link'
                  }, {
                    time: 'Feb 8, 4:00 PM',
                    source: 'In-app'
                  }].map((view, i) => <div key={i} className="flex items-center gap-2" data-id="element-2151">
                              <div className="w-1.5 h-1.5 rounded-full bg-teal-400" data-id="element-2152" />
                              <span className="text-[11px] text-gray-500" data-id="element-2153">
                                {view.time}
                              </span>
                              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded" data-id="element-2154">
                                {view.source}
                              </span>
                            </div>)}
                        </div>
                      </div>

                      <div className="h-px bg-gray-100" data-id="element-2155" />

                      {/* Response Status */}
                      <div className="space-y-2" data-id="element-2156">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-2157">
                          Client Response
                        </p>
                        {isAccepted ? <div className="flex items-center gap-1.5" data-id="element-2158">
                            <CheckCircle2 size={14} className="text-green-500" data-id="element-2159" />
                            <span className="text-sm font-medium text-green-600" data-id="element-2160">
                              Accepted on Oct 21, 2023
                            </span>
                          </div> : isRejected ? <div className="flex items-center gap-1.5" data-id="element-2161">
                            <XCircle size={14} className="text-red-500" data-id="element-2162" />
                            <span className="text-sm font-medium text-red-600" data-id="element-2163">
                              Rejected on Oct 22, 2023
                            </span>
                          </div> : <div className="flex items-center gap-1.5" data-id="element-2164">
                            <AlertTriangle size={12} className="text-amber-500" data-id="element-2165" />
                            <span className="text-[11px] text-amber-600 font-medium" data-id="element-2166">
                              Awaiting response
                            </span>
                          </div>}
                      </div>
                    </Card>}

                  {/* Smart Reminder Suggestion */}
                  {isSent && isSentStatus && !isTerminal && <motion.div initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} data-id="element-2167">
                      <div className="border-l-4 border-blue-400 bg-blue-50/50 rounded-r-xl p-4" data-id="element-2168">
                        <div className="flex items-center gap-2 mb-1.5" data-id="element-2169">
                          <Lightbulb size={16} className="text-blue-600" data-id="element-2170" />
                          <p className="font-bold text-sm text-trustopay-navy" data-id="element-2171">
                            Follow Up Suggestion
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mb-3" data-id="element-2172">
                          Client viewed the quotation 3 times but hasn't
                          responded yet. A gentle follow-up might help.
                        </p>
                        <div className="flex gap-2" data-id="element-2173">
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-2174">
                            <Send size={12} data-id="element-2175" /> Send Follow-up
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-2176">
                            <Phone size={12} data-id="element-2177" /> Call Client
                          </Button>
                        </div>
                      </div>
                    </motion.div>}

                  {isExpired && isSent && <motion.div initial={{
              opacity: 0,
              y: 8
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.2
            }} data-id="element-2178">
                      <div className="border-l-4 border-amber-400 bg-amber-50/50 rounded-r-xl p-4" data-id="element-2179">
                        <div className="flex items-center gap-2 mb-1.5" data-id="element-2180">
                          <AlertTriangle size={16} className="text-amber-600" data-id="element-2181" />
                          <p className="font-bold text-sm text-trustopay-navy" data-id="element-2182">
                            Quotation Expired
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mb-3" data-id="element-2183">
                          This quotation has expired. You can create a new
                          version or duplicate it with updated terms.
                        </p>
                        <div className="flex gap-2" data-id="element-2184">
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1" data-id="element-2185">
                            <Copy size={12} data-id="element-2186" /> Duplicate & Update
                          </Button>
                        </div>
                      </div>
                    </motion.div>}

                  {/* Version History */}
                  <Card className="overflow-hidden" data-id="element-2187">
                    <button onClick={() => setShowVersionHistory(!showVersionHistory)} className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors" data-id="element-2188">
                      <div className="flex items-center gap-2" data-id="element-2189">
                        <History size={16} className="text-gray-400" data-id="element-2190" />
                        <span className="font-bold text-sm text-trustopay-navy" data-id="element-2191">
                          Version History
                        </span>
                      </div>
                      {showVersionHistory ? <ChevronUp size={16} data-id="element-2192" /> : <ChevronDown size={16} data-id="element-2193" />}
                    </button>
                    <AnimatePresence data-id="element-2194">
                      {showVersionHistory && <motion.div initial={{
                  height: 0
                }} animate={{
                  height: 'auto'
                }} exit={{
                  height: 0
                }} className="overflow-hidden bg-gray-50 border-t border-gray-100" data-id="element-2195">
                          <div className="p-4 space-y-4" data-id="element-2196">
                            {versionHistory.map((ver, i) => <div key={i} className="relative pl-4 border-l-2 border-gray-200" data-id="element-2197">
                                <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-300" data-id="element-2198" />
                                <p className="text-xs font-bold text-trustopay-navy" data-id="element-2199">
                                  {ver.version}
                                </p>
                                <p className="text-[10px] text-gray-400 mb-1" data-id="element-2200">
                                  {ver.date}
                                </p>
                                <ul className="space-y-0.5" data-id="element-2201">
                                  {ver.changes.map((change, j) => <li key={j} className="text-xs text-gray-600" data-id="element-2202">
                                      • {change}
                                    </li>)}
                                </ul>
                              </div>)}
                          </div>
                        </motion.div>}
                    </AnimatePresence>
                  </Card>

                  {/* Activity Log */}
                  <div className="pt-4" data-id="element-2203">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1" data-id="element-2204">
                      Activity Log
                    </p>
                    <div className="space-y-6 pl-2" data-id="element-2205">
                      {activityLog.map((log, i) => <div key={i} className="flex gap-3" data-id="element-2206">
                          <div className="relative" data-id="element-2207">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${log.color}`} data-id="element-2208">
                              <log.icon size={14} data-id="element-2209" />
                            </div>
                            {i < activityLog.length - 1 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-100 -z-0" data-id="element-2210" />}
                          </div>
                          <div className="pt-1" data-id="element-2211">
                            <p className="text-xs text-gray-400 mb-0.5" data-id="element-2212">
                              {log.date}
                            </p>
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-2213">
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
          }} className="p-5" data-id="element-2214">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative" data-id="element-2215">
                    {/* Withdrawn Watermark */}
                    {isWithdrawn && <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden" data-id="element-2216">
                        <div className="transform -rotate-45 border-4 border-red-500/30 text-red-500/30 text-5xl font-black px-6 py-3 rounded-xl uppercase tracking-widest" data-id="element-2217">
                          WITHDRAWN
                        </div>
                      </div>}

                    <div className={cn('p-6', isWithdrawn && 'opacity-50 grayscale-[0.5]')} data-id="element-2218">
                      <div className="flex justify-between items-start mb-8" data-id="element-2219">
                        <div className="flex items-center gap-2.5" data-id="element-2220">
                          <div className="w-10 h-10 bg-trustopay-purple rounded-xl flex items-center justify-center" data-id="element-2221">
                            <span className="text-white font-bold text-sm" data-id="element-2222">
                              TP
                            </span>
                          </div>
                          <div data-id="element-2223">
                            <p className="font-bold text-trustopay-navy text-sm" data-id="element-2224">
                              Trustopay
                            </p>
                            <p className="text-[10px] text-gray-400" data-id="element-2225">
                              trustopay.com
                            </p>
                          </div>
                        </div>
                        <div className="text-right" data-id="element-2226">
                          <h3 className="text-xl font-bold text-trustopay-navy tracking-tight" data-id="element-2227">
                            QUOTATION
                          </h3>
                          <p className="text-xs text-gray-400 font-medium" data-id="element-2228">
                            {localQuote.id}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-8" data-id="element-2229">
                        <div data-id="element-2230">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-2231">
                            From
                          </p>
                          <p className="font-bold text-trustopay-navy text-sm" data-id="element-2232">
                            Arjun Mehta
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2233">
                            arjun@trustopay.com
                          </p>
                        </div>
                        <div data-id="element-2234">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2" data-id="element-2235">
                            Bill To
                          </p>
                          <p className="font-bold text-trustopay-navy text-sm" data-id="element-2236">
                            {localQuote.client}
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2237">
                            client@example.com
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 mb-6" data-id="element-2238">
                        <div className="flex-1 bg-gray-50 rounded-lg p-3" data-id="element-2239">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-2240">
                            Quote Date
                          </p>
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-2241">
                            {localQuote.date}
                          </p>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3" data-id="element-2242">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5" data-id="element-2243">
                            Valid Until
                          </p>
                          <p className="text-sm font-medium text-trustopay-navy" data-id="element-2244">
                            {localQuote.validUntil}
                          </p>
                        </div>
                      </div>

                      <div className="mb-6" data-id="element-2245">
                        <div className="grid grid-cols-12 gap-2 pb-2 border-b-2 border-trustopay-navy mb-3" data-id="element-2246">
                          <p className="col-span-6 text-[9px] font-bold text-gray-400 uppercase tracking-widest" data-id="element-2247">
                            Description
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center" data-id="element-2248">
                            Qty
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right" data-id="element-2249">
                            Rate
                          </p>
                          <p className="col-span-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right" data-id="element-2250">
                            Amount
                          </p>
                        </div>
                        <div className="grid grid-cols-12 gap-2 py-2.5 border-b border-gray-100" data-id="element-2251">
                          <div className="col-span-6" data-id="element-2252">
                            <p className="text-sm font-medium text-trustopay-navy" data-id="element-2253">
                              Web Design Services
                            </p>
                          </div>
                          <p className="col-span-2 text-sm text-gray-600 text-center" data-id="element-2254">
                            1
                          </p>
                          <p className="col-span-2 text-sm text-gray-600 text-right" data-id="element-2255">
                            {formatINR(subtotal)}
                          </p>
                          <p className="col-span-2 text-sm font-medium text-trustopay-navy text-right" data-id="element-2256">
                            {formatINR(subtotal)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end" data-id="element-2257">
                        <div className="w-48 space-y-2" data-id="element-2258">
                          <div className="flex justify-between text-sm" data-id="element-2259">
                            <span className="text-gray-500" data-id="element-2260">Subtotal</span>
                            <span className="text-gray-700" data-id="element-2261">
                              {formatINR(subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm" data-id="element-2262">
                            <span className="text-gray-500" data-id="element-2263">GST (18%)</span>
                            <span className="text-gray-700" data-id="element-2264">
                              {formatINR(gst)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-trustopay-navy pt-2 border-t-2 border-trustopay-navy" data-id="element-2265">
                            <span data-id="element-2266">Total</span>
                            <span data-id="element-2267">{formatINR(localQuote.amount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gradient-to-r from-trustopay-purple via-purple-400 to-trustopay-purple" data-id="element-2268" />
                  </div>

                  <div className="mt-4 flex gap-3" data-id="element-2269">
                    <Button variant="outline" className="flex-1 gap-2" data-id="element-2270">
                      <FileDown size={18} data-id="element-2271" /> Download PDF
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2" data-id="element-2272">
                      <Share2 size={18} data-id="element-2273" /> Share
                    </Button>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0" data-id="element-2274">
            {isDraft && <div className="flex gap-3" data-id="element-2275">
                <Button variant="outline" className="flex-1" onClick={handleEdit} data-id="element-2276">
                  Edit
                </Button>
                <Button className="flex-[2]" data-id="element-2277">Send Quote</Button>
              </div>}
            {isSentStatus && <div className="flex gap-3" data-id="element-2278">
                <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50" data-id="element-2279">
                  Reject
                </Button>
                <Button className="flex-[2] bg-green-600 hover:bg-green-700" data-id="element-2280">
                  Mark Accepted
                </Button>
              </div>}
            {isAccepted && <Button className="w-full" onClick={onConvertToInvoice} data-id="element-2281">
                Convert to Invoice
              </Button>}
            {isRejected && <Button variant="outline" className="w-full" onClick={handleDuplicate} data-id="element-2282">
                Create New Version
              </Button>}
            {isConverted && <Button variant="outline" className="w-full" data-id="element-2283">
                View Invoice
              </Button>}
            {isWithdrawn && <div className="flex gap-3" data-id="element-2284">
                <Button variant="outline" className="flex-1 gap-2" data-id="element-2285">
                  <FileDown size={18} data-id="element-2286" /> Download PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleDuplicate} data-id="element-2287">
                  Duplicate
                </Button>
              </div>}
            {isExpired && <Button variant="outline" className="w-full" onClick={handleDuplicate} data-id="element-2288">
                Duplicate & Resend
              </Button>}
          </div>

          {/* ACTION MENU BOTTOM SHEET */}
          <AnimatePresence data-id="element-2289">
            {showActionMenu && <>
                <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} exit={{
            opacity: 0
          }} className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setShowActionMenu(false)} data-id="element-2290" />
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
          }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] max-w-[430px] mx-auto overflow-hidden" data-id="element-2291">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center" data-id="element-2292">
                    <h3 className="font-bold text-trustopay-navy" data-id="element-2293">
                      Quotation Actions
                    </h3>
                    <button onClick={() => setShowActionMenu(false)} className="p-1 bg-gray-100 rounded-full" data-id="element-2294">
                      <X size={16} data-id="element-2295" />
                    </button>
                  </div>
                  <div className="p-2" data-id="element-2296">
                    {/* EDIT */}
                    {(isDraft || isSentStatus) && <button onClick={handleEdit} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2297">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600" data-id="element-2298">
                          <Edit2 size={20} data-id="element-2299" />
                        </div>
                        <div data-id="element-2300">
                          <p className="font-bold text-trustopay-navy" data-id="element-2301">
                            Edit Quotation
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2302">
                            Modify details or update terms
                          </p>
                        </div>
                      </button>}

                    {/* DUPLICATE */}
                    <button onClick={handleDuplicate} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2303">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-trustopay-purple" data-id="element-2304">
                        <Copy size={20} data-id="element-2305" />
                      </div>
                      <div data-id="element-2306">
                        <p className="font-bold text-trustopay-navy" data-id="element-2307">
                          Duplicate Quotation
                        </p>
                        <p className="text-xs text-gray-500" data-id="element-2308">
                          Create a copy as a new draft
                        </p>
                      </div>
                    </button>

                    {/* WITHDRAW / DELETE */}
                    {isDraft && <button onClick={handleDelete} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 rounded-xl text-left" data-id="element-2309">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" data-id="element-2310">
                          <Trash2 size={20} data-id="element-2311" />
                        </div>
                        <div data-id="element-2312">
                          <p className="font-bold text-red-600" data-id="element-2313">Delete Draft</p>
                          <p className="text-xs text-red-400" data-id="element-2314">
                            Permanently remove this draft
                          </p>
                        </div>
                      </button>}
                    {isSentStatus && <button onClick={handleWithdraw} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 rounded-xl text-left" data-id="element-2315">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" data-id="element-2316">
                          <XCircle size={20} data-id="element-2317" />
                        </div>
                        <div data-id="element-2318">
                          <p className="font-bold text-red-600" data-id="element-2319">
                            Withdraw Quotation
                          </p>
                          <p className="text-xs text-red-400" data-id="element-2320">
                            Cancel and notify client
                          </p>
                        </div>
                      </button>}

                    {/* DOWNLOAD */}
                    {!isDraft && <button onClick={() => {
                setShowActionMenu(false);
                showToastMsg('success', 'Downloading PDF...');
              }} className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 rounded-xl text-left" data-id="element-2321">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600" data-id="element-2322">
                          <FileDown size={20} data-id="element-2323" />
                        </div>
                        <div data-id="element-2324">
                          <p className="font-bold text-trustopay-navy" data-id="element-2325">
                            Download PDF
                          </p>
                          <p className="text-xs text-gray-500" data-id="element-2326">
                            Save quotation file
                          </p>
                        </div>
                      </button>}
                  </div>
                </motion.div>
              </>}
          </AnimatePresence>

          {/* EDIT WARNING MODAL (Sent) */}
          <AnimatePresence data-id="element-2327">
            {showEditWarning && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2328">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2329">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2330">
                    <AlertTriangle size={24} className="text-amber-600" data-id="element-2331" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2332">
                    Edit Sent Quotation?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4" data-id="element-2333">
                    This quotation has been sent to the client. Editing will
                    create a new version and notify the client.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 mb-6 text-xs space-y-2" data-id="element-2334">
                    <div className="flex items-center gap-2 text-green-600" data-id="element-2335">
                      <Check size={12} data-id="element-2336" /> Terms, notes, validity date
                    </div>
                    <div className="flex items-center gap-2 text-green-600" data-id="element-2337">
                      <Check size={12} data-id="element-2338" /> Items and amounts
                    </div>
                    <div className="flex items-center gap-2 text-gray-400" data-id="element-2339">
                      <Info size={12} data-id="element-2340" /> Client will be notified of changes
                    </div>
                  </div>
                  <div className="flex gap-3" data-id="element-2341">
                    <Button variant="outline" className="flex-1" onClick={() => setShowEditWarning(false)} data-id="element-2342">
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => {
                setShowEditWarning(false);
                showToastMsg('success', 'Editing mode — new version will be created');
              }} data-id="element-2343">
                      Continue Editing
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* DELETE CONFIRM MODAL (Draft) */}
          <AnimatePresence data-id="element-2344">
            {showDeleteConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2345">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2346">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2347">
                    <Trash2 size={24} className="text-red-600" data-id="element-2348" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2349">
                    Delete Draft Quotation?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-2350">
                    Are you sure you want to delete this draft? This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3" data-id="element-2351">
                    <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(false)} data-id="element-2352">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmDelete} data-id="element-2353">
                      Delete
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* DELETE ERROR MODAL (Sent) */}
          <AnimatePresence data-id="element-2354">
            {showDeleteError && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2355">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2356">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2357">
                    <XCircle size={24} className="text-red-600" data-id="element-2358" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2359">
                    Cannot Delete Sent Quotation
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-6" data-id="element-2360">
                    Sent quotations cannot be deleted for record-keeping. You
                    can withdraw it instead.
                  </p>
                  <div className="flex gap-3" data-id="element-2361">
                    <Button variant="outline" className="flex-1" onClick={() => setShowDeleteError(false)} data-id="element-2362">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => {
                setShowDeleteError(false);
                handleWithdraw();
              }} data-id="element-2363">
                      Withdraw
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>

          {/* WITHDRAW CONFIRM MODAL */}
          <AnimatePresence data-id="element-2364">
            {showWithdrawConfirm && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" data-id="element-2365">
                <motion.div initial={{
            scale: 0.95
          }} animate={{
            scale: 1
          }} className="bg-white rounded-2xl p-6 w-full max-w-sm" data-id="element-2366">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-2367">
                    <AlertTriangle size={24} className="text-red-600" data-id="element-2368" />
                  </div>
                  <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-2369">
                    Withdraw Quotation?
                  </h3>
                  <p className="text-sm text-gray-500 text-center mb-4" data-id="element-2370">
                    This will mark the quotation as withdrawn and notify the
                    client. This action cannot be undone.
                  </p>
                  <div className="mb-6" data-id="element-2371">
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block" data-id="element-2372">
                      Reason (Optional)
                    </label>
                    <Input placeholder="e.g. Terms changed, pricing updated" value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)} data-id="element-2373" />
                  </div>
                  <div className="flex gap-3" data-id="element-2374">
                    <Button variant="outline" className="flex-1" onClick={() => setShowWithdrawConfirm(false)} data-id="element-2375">
                      Cancel
                    </Button>
                    <Button variant="danger" className="flex-1" onClick={confirmWithdraw} data-id="element-2376">
                      Withdraw
                    </Button>
                  </div>
                </motion.div>
              </motion.div>}
          </AnimatePresence>
        </motion.div>}
    </AnimatePresence>;
}