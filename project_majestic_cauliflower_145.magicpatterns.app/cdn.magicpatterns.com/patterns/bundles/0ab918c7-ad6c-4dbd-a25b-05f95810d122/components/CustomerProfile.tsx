import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Send, FileText, Phone, MoreVertical, CheckCircle2, User, Ban, Paperclip, AlertTriangle, ChevronRight, Download, X, Image, ArrowDownLeft, ArrowUpRight, Copy, Mail, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatINR } from '../lib/utils';
interface CustomerProfileProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSendMoney: () => void;
  onCreateInvoice: () => void;
  onSelectTransaction: (tx: any) => void;
  onSelectInvoice?: (invoiceId: string) => void;
}
interface ChatMessage {
  id: string;
  type: 'payment' | 'invoice' | 'message' | 'attachment';
  direction: 'in' | 'out';
  text?: string;
  amount?: number;
  date: string;
  status?: string;
  invoiceRef?: string;
  milestone?: string;
  note?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}
export function CustomerProfile({
  isOpen,
  onClose,
  customer,
  onSendMoney,
  onCreateInvoice,
  onSelectTransaction,
  onSelectInvoice
}: CustomerProfileProps) {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showAttachment, setShowAttachment] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Mock UPI for customer
  const customerUpi = customer ? `${customer.name?.split(' ')[0]?.toLowerCase()}@trustopay` : '';
  // Mock invoices for this customer
  const customerInvoices = customer?.name === 'Priya Sharma' ? [{
    id: 'INV-006',
    amount: 15000,
    date: 'Oct 10, 2023',
    status: 'partial',
    note: 'Website Design Project',
    direction: 'out' as const
  }, {
    id: 'INV-012',
    amount: 8000,
    date: 'Sep 5, 2023',
    status: 'paid',
    note: 'UI Consultation',
    direction: 'out' as const
  }] : [{
    id: 'INV-007',
    amount: 2500,
    date: 'Oct 20, 2023',
    status: 'paid',
    note: 'Logo Design',
    direction: 'in' as const
  }, {
    id: 'INV-015',
    amount: 4500,
    date: 'Aug 12, 2023',
    status: 'paid',
    note: 'Brand Kit',
    direction: 'in' as const
  }];
  const chatHistory: ChatMessage[] = customer?.name === 'Priya Sharma' ? [{
    id: '1',
    type: 'invoice',
    direction: 'out',
    amount: 15000,
    date: 'Oct 10, 9:30 AM',
    status: 'Sent',
    invoiceRef: 'INV-006',
    note: 'Website Design Project'
  }, {
    id: '2',
    type: 'payment',
    direction: 'in',
    amount: 5000,
    date: 'Oct 15, 2:15 PM',
    status: 'Completed',
    invoiceRef: 'INV-006',
    milestone: 'Milestone 1 of 3',
    note: 'First milestone payment'
  }, {
    id: '3',
    type: 'message',
    direction: 'in',
    text: 'First milestone done, starting phase 2 now.',
    date: 'Oct 16, 10:00 AM'
  }, {
    id: '6',
    type: 'attachment',
    direction: 'in',
    text: 'design-mockup-v2.png',
    date: 'Oct 18, 3:00 PM',
    attachmentUrl: 'https://cdn.magicpatterns.com/uploads/dz4FyAnFn5msF5rjby6ThE/image.png',
    attachmentName: 'design-mockup-v2.png'
  }, {
    id: '4',
    type: 'payment',
    direction: 'in',
    amount: 5000,
    date: 'Oct 24, 10:23 AM',
    status: 'Completed',
    invoiceRef: 'INV-006',
    milestone: 'Milestone 2 of 3',
    note: 'Second milestone payment'
  }, {
    id: '5',
    type: 'message',
    direction: 'out',
    text: 'Thanks! Final delivery next week.',
    date: 'Oct 24, 10:45 AM'
  }] : [{
    id: '1',
    type: 'invoice',
    direction: 'in',
    amount: 2500,
    date: 'Oct 20, 11:00 AM',
    status: 'Received',
    invoiceRef: 'INV-007',
    note: 'Logo Design'
  }, {
    id: '2',
    type: 'payment',
    direction: 'out',
    amount: 2500,
    date: 'Oct 21, 4:45 PM',
    status: 'Completed',
    invoiceRef: 'INV-007',
    note: 'Full Payment'
  }, {
    id: '3',
    type: 'message',
    direction: 'in',
    text: 'Payment received, thanks!',
    date: 'Oct 21, 5:00 PM'
  }, {
    id: '4',
    type: 'attachment',
    direction: 'in',
    text: 'final-logo.png',
    date: 'Oct 22, 9:00 AM',
    attachmentUrl: 'https://cdn.magicpatterns.com/uploads/aj34iEtSdoce7fmpzMgM5k/image.png',
    attachmentName: 'final-logo.png'
  }];
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    }
  }, [isOpen]);
  const handleCall = () => {
    setShowCallAlert(true);
    setTimeout(() => setShowCallAlert(false), 2000);
  };
  const handleCopyUpi = () => {
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };
  if (!customer) return null;
  return <AnimatePresence data-id="element-694">
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
    }} className="fixed inset-0 z-50 bg-gray-50 flex flex-col max-w-[430px] mx-auto" data-id="element-695">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100 shadow-sm z-10 relative" data-id="element-696">
            <div className="flex items-center gap-3" data-id="element-697">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-698">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-699" />
              </button>
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowProfileDetails(true)} data-id="element-700">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${customer.color}`} data-id="element-701">
                  {customer.initials}
                </div>
                <div data-id="element-702">
                  <h2 className="font-bold text-trustopay-navy leading-tight" data-id="element-703">
                    {customer.name}
                  </h2>
                  <p className="text-xs text-gray-500" data-id="element-704">{customer.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-1" data-id="element-705">
              <button onClick={handleCall} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-706">
                <Phone size={20} data-id="element-707" />
              </button>
              <div className="relative" data-id="element-708">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" data-id="element-709">
                  <MoreVertical size={20} data-id="element-710" />
                </button>

                {showMenu && <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} data-id="element-711" />
                    <div className="absolute right-0 top-10 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden" data-id="element-712">
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2" onClick={() => {
                  setShowProfileDetails(true);
                  setShowMenu(false);
                }} data-id="element-713">
                        <User size={16} data-id="element-714" /> View Profile
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2" onClick={() => {
                  setShowInvoiceList(true);
                  setShowMenu(false);
                }} data-id="element-715">
                        <FileText size={16} data-id="element-716" /> All Invoices
                      </button>
                      <div className="h-px bg-gray-100" data-id="element-717" />
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-orange-600 flex items-center gap-2" data-id="element-718">
                        <AlertTriangle size={16} data-id="element-719" /> Report
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-red-600 flex items-center gap-2" data-id="element-720">
                        <Ban size={16} data-id="element-721" /> Block User
                      </button>
                    </div>
                  </>}
              </div>
            </div>
          </div>

          {/* Call Alert */}
          <AnimatePresence data-id="element-722">
            {showCallAlert && <motion.div initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0
        }} className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm z-50 flex items-center gap-2" data-id="element-723">
                <Phone size={14} className="animate-pulse" data-id="element-724" /> Calling{' '}
                {customer.name}...
              </motion.div>}
          </AnimatePresence>

          {/* Full Profile Overlay */}
          <AnimatePresence data-id="element-725">
            {showProfileDetails && <motion.div initial={{
          x: '100%'
        }} animate={{
          x: 0
        }} exit={{
          x: '100%'
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }} className="absolute inset-0 z-30 bg-white flex flex-col" data-id="element-726">
                <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-727">
                  <button onClick={() => setShowProfileDetails(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-728">
                    <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-729" />
                  </button>
                  <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-730">
                    Profile
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto" data-id="element-731">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-b from-purple-50 to-white pt-8 pb-6 text-center" data-id="element-732">
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 ${customer.color} ring-4 ring-white shadow-lg`} data-id="element-733">
                      {customer.initials}
                    </div>
                    <h2 className="text-2xl font-bold text-trustopay-navy" data-id="element-734">
                      {customer.name}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1" data-id="element-735">
                      {customer.phone}
                    </p>
                  </div>

                  <div className="px-5 space-y-4 pb-8" data-id="element-736">
                    {/* UPI ID */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl" data-id="element-737">
                      <div className="flex items-center gap-3" data-id="element-738">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center" data-id="element-739">
                          <Globe size={16} className="text-trustopay-purple" data-id="element-740" />
                        </div>
                        <div data-id="element-741">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-742">
                            UPI ID
                          </p>
                          <p className="font-medium text-trustopay-navy text-sm" data-id="element-743">
                            {customerUpi}
                          </p>
                        </div>
                      </div>
                      <button onClick={handleCopyUpi} className="p-2 hover:bg-gray-200 rounded-full text-gray-400" data-id="element-744">
                        {copiedUpi ? <CheckCircle2 size={16} className="text-green-500" data-id="element-745" /> : <Copy size={16} data-id="element-746" />}
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-747">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center" data-id="element-748">
                        <Phone size={16} className="text-blue-600" data-id="element-749" />
                      </div>
                      <div data-id="element-750">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-751">
                          Phone
                        </p>
                        <p className="font-medium text-trustopay-navy text-sm" data-id="element-752">
                          {customer.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl" data-id="element-753">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center" data-id="element-754">
                        <Mail size={16} className="text-green-600" data-id="element-755" />
                      </div>
                      <div data-id="element-756">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold" data-id="element-757">
                          Email
                        </p>
                        <p className="font-medium text-trustopay-navy text-sm" data-id="element-758">
                          {customer.name?.split(' ')[0]?.toLowerCase()}
                          @example.com
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-2" data-id="element-759">
                      <div className="bg-gray-50 p-3 rounded-xl text-center" data-id="element-760">
                        <p className="text-xs text-gray-500 mb-1" data-id="element-761">Total Paid</p>
                        <p className="font-bold text-trustopay-navy" data-id="element-762">₹25k</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-xl text-center" data-id="element-763">
                        <p className="text-xs text-gray-500 mb-1" data-id="element-764">Received</p>
                        <p className="font-bold text-green-600" data-id="element-765">₹12k</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-xl text-center" data-id="element-766">
                        <p className="text-xs text-gray-500 mb-1" data-id="element-767">Invoices</p>
                        <p className="font-bold text-trustopay-purple" data-id="element-768">
                          {customerInvoices.length}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2" data-id="element-769">
                      <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium" data-id="element-770">
                        <AlertTriangle size={16} data-id="element-771" /> Report
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium" data-id="element-772">
                        <Ban size={16} data-id="element-773" /> Block
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Invoice List Overlay */}
          <AnimatePresence data-id="element-774">
            {showInvoiceList && <motion.div initial={{
          x: '100%'
        }} animate={{
          x: 0
        }} exit={{
          x: '100%'
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }} className="absolute inset-0 z-30 bg-white flex flex-col" data-id="element-775">
                <div className="p-5 flex items-center bg-white border-b border-gray-100" data-id="element-776">
                  <button onClick={() => setShowInvoiceList(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full" data-id="element-777">
                    <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-778" />
                  </button>
                  <h2 className="ml-2 font-bold text-lg text-trustopay-navy" data-id="element-779">
                    Invoices with {customer.name?.split(' ')[0]}
                  </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-3" data-id="element-780">
                  {customerInvoices.map(inv => <Card key={inv.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
              setShowInvoiceList(false);
              if (onSelectInvoice) onSelectInvoice(inv.id);
            }} data-id="element-781">
                      <div className="flex items-center justify-between" data-id="element-782">
                        <div className="flex items-center gap-3" data-id="element-783">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.direction === 'out' ? 'bg-purple-50' : 'bg-blue-50'}`} data-id="element-784">
                            <FileText size={18} className={inv.direction === 'out' ? 'text-trustopay-purple' : 'text-blue-600'} data-id="element-785" />
                          </div>
                          <div data-id="element-786">
                            <p className="font-bold text-trustopay-navy text-sm" data-id="element-787">
                              {inv.note}
                            </p>
                            <p className="text-xs text-gray-400" data-id="element-788">
                              #{inv.id} • {inv.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2" data-id="element-789">
                          <div data-id="element-790">
                            <p className="font-bold text-trustopay-navy text-sm" data-id="element-791">
                              {formatINR(inv.amount)}
                            </p>
                            <p className={`text-[10px] font-medium capitalize ${inv.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`} data-id="element-792">
                              {inv.status}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-300" data-id="element-793" />
                        </div>
                      </div>
                    </Card>)}

                  {customerInvoices.length === 0 && <div className="text-center py-12 text-gray-400" data-id="element-794">
                      No invoices found
                    </div>}
                </div>
              </motion.div>}
          </AnimatePresence>

          {/* Attachment Viewer */}
          <AnimatePresence data-id="element-795">
            {showAttachment && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setShowAttachment(null)} data-id="element-796">
                <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20" data-id="element-797">
                  <X size={24} data-id="element-798" />
                </button>
                <img src={showAttachment} alt="Attachment" className="max-w-full max-h-[70vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} data-id="element-799" />
                <Button variant="outline" className="mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20 gap-2" data-id="element-800">
                  <Download size={16} data-id="element-801" /> Download
                </Button>
              </motion.div>}
          </AnimatePresence>

          {/* Chat Timeline */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white pb-24" data-id="element-802">
            <div className="text-center text-xs text-gray-400 my-4" data-id="element-803">
              Oct 10, 2023
            </div>

            {chatHistory.map(item => <div key={item.id} className={`flex ${item.direction === 'out' ? 'justify-end' : 'justify-start'}`} data-id="element-804">
                {item.type === 'message' ? <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${item.direction === 'out' ? 'bg-trustopay-purple text-white rounded-br-none' : 'bg-gray-100 text-trustopay-navy rounded-bl-none'}`} data-id="element-805">
                    {item.text}
                    <p className={`text-[10px] mt-1 ${item.direction === 'out' ? 'text-purple-200' : 'text-gray-400'}`} data-id="element-806">
                      {item.date.split(',')[1]}
                    </p>
                  </div> : item.type === 'attachment' ? <div className={`max-w-[75%] rounded-2xl overflow-hidden cursor-pointer ${item.direction === 'out' ? 'rounded-br-none' : 'rounded-bl-none'}`} onClick={() => item.attachmentUrl && setShowAttachment(item.attachmentUrl)} data-id="element-807">
                    <div className="relative" data-id="element-808">
                      <img src={item.attachmentUrl} alt={item.attachmentName} className="w-full h-40 object-cover" data-id="element-809" />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" data-id="element-810" />
                    </div>
                    <div className={`px-3 py-2 flex items-center gap-2 ${item.direction === 'out' ? 'bg-purple-50' : 'bg-gray-100'}`} data-id="element-811">
                      <Image size={14} className="text-gray-400" data-id="element-812" />
                      <span className="text-xs text-gray-600 truncate" data-id="element-813">
                        {item.attachmentName}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto whitespace-nowrap" data-id="element-814">
                        {item.date.split(',')[1]}
                      </span>
                    </div>
                  </div> /* Payment & Invoice Cards */ : <Card onClick={() => {
            if (item.type === 'payment') {
              onSelectTransaction({
                id: item.id,
                name: customer.name,
                amount: item.amount,
                date: item.date,
                type: item.direction === 'in' ? 'received' : 'sent',
                status: 'completed',
                invoiceRef: item.invoiceRef,
                milestone: item.milestone ? {
                  current: 2,
                  total: 3
                } : undefined,
                note: item.note
              });
            } else if (item.type === 'invoice' && onSelectInvoice && item.invoiceRef) {
              onSelectInvoice(item.invoiceRef);
            }
          }} className={`max-w-[85%] p-0 cursor-pointer hover:shadow-md transition-shadow overflow-hidden border-0`} data-id="element-815">
                    {/* Color-coded top strip */}
                    <div className={`h-1 ${item.type === 'invoice' ? 'bg-trustopay-purple' : item.direction === 'in' ? 'bg-green-500' : 'bg-red-400'}`} data-id="element-816" />

                    <div className="p-4" data-id="element-817">
                      {/* Type badge */}
                      <div className="flex items-center justify-between mb-2" data-id="element-818">
                        <div className="flex items-center gap-2" data-id="element-819">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${item.type === 'invoice' ? 'bg-purple-100' : item.direction === 'in' ? 'bg-green-100' : 'bg-red-100'}`} data-id="element-820">
                            {item.type === 'invoice' ? <FileText size={12} className="text-trustopay-purple" data-id="element-821" /> : item.direction === 'in' ? <ArrowDownLeft size={12} className="text-green-600" data-id="element-822" /> : <ArrowUpRight size={12} className="text-red-500" data-id="element-823" />}
                          </div>
                          <span className={`text-xs font-semibold ${item.type === 'invoice' ? 'text-trustopay-purple' : item.direction === 'in' ? 'text-green-600' : 'text-red-500'}`} data-id="element-824">
                            {item.type === 'payment' ? item.direction === 'out' ? 'Payment Sent' : 'Payment Received' : item.direction === 'out' ? 'Invoice Sent' : 'Invoice Received'}
                          </span>
                        </div>
                        {item.type === 'payment' && <span className="text-[10px] font-medium text-green-600 flex items-center gap-1" data-id="element-825">
                            <CheckCircle2 size={10} data-id="element-826" /> Done
                          </span>}
                      </div>

                      <h3 className="text-2xl font-bold text-trustopay-navy mb-1" data-id="element-827">
                        {formatINR(item.amount || 0)}
                      </h3>

                      <p className="text-xs font-medium text-gray-600 mb-1" data-id="element-828">
                        {item.note}
                      </p>

                      {item.invoiceRef && <p className="text-[10px] text-gray-400 flex items-center gap-1" data-id="element-829">
                          <FileText size={10} data-id="element-830" /> #{item.invoiceRef}
                        </p>}

                      {item.milestone && <div className="mt-3 pt-3 border-t border-gray-100" data-id="element-831">
                          <div className="flex justify-between items-center mb-1" data-id="element-832">
                            <span className="text-[10px] font-medium text-gray-500" data-id="element-833">
                              {item.milestone}
                            </span>
                          </div>
                          <div className="flex gap-1" data-id="element-834">
                            {[1, 2, 3].map((dot, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i < 2 ? 'bg-green-500' : 'bg-gray-100'}`} data-id="element-835" />)}
                          </div>
                        </div>}

                      <p className="text-[10px] text-gray-400 mt-2 text-right" data-id="element-836">
                        {item.date.split(',')[1]}
                      </p>
                    </div>
                  </Card>}
              </div>)}
          </div>

          {/* Bottom Action Bar */}
          <div className="p-3 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 flex items-center gap-2" data-id="element-837">
            <button onClick={onSendMoney} className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-trustopay-navy" data-id="element-838">
              <Send size={20} className="mb-1 text-trustopay-purple" data-id="element-839" />
              <span className="text-[10px] font-medium" data-id="element-840">Pay</span>
            </button>

            <button onClick={onCreateInvoice} className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gray-50 hover:bg-gray-100 text-trustopay-navy" data-id="element-841">
              <FileText size={20} className="mb-1 text-trustopay-purple" data-id="element-842" />
              <span className="text-[10px] font-medium" data-id="element-843">Invoice</span>
            </button>

            <div className="flex-1 relative" data-id="element-844">
              <input type="text" placeholder="Message..." className="w-full h-12 bg-gray-100 rounded-xl pl-4 pr-20 text-sm outline-none focus:ring-2 focus:ring-trustopay-purple/20" value={message} onChange={e => setMessage(e.target.value)} data-id="element-845" />
              <div className="absolute right-2 top-2 flex items-center gap-0.5" data-id="element-846">
                <button className="p-2 text-gray-400 hover:text-trustopay-purple rounded-full transition-colors" data-id="element-847">
                  <Paperclip size={18} data-id="element-848" />
                </button>
                <button className="p-1.5 bg-trustopay-purple text-white rounded-lg w-8 h-8 flex items-center justify-center" data-id="element-849">
                  <Send size={14} data-id="element-850" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>}
    </AnimatePresence>;
}