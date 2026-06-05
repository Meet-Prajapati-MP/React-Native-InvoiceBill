import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, AlertCircle, Loader2, Mail, MessageCircle, Smartphone, Calendar, Clock, ChevronDown, ChevronUp, FileText, Eye, X, Send, Paperclip, User, Search } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { cn, formatINR } from '../lib/utils';
interface PaymentReminderProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedInvoices?: any[];
}
const TEMPLATES = [{
  id: 'gentle',
  name: '💼 Gentle Reminder (Due Soon)',
  desc: 'For invoices approaching due date',
  subject: 'Friendly Reminder: Invoice {invoice_number} Due Soon',
  body: `Hi {client_name},\n\nI hope this message finds you well.\n\nThis is a gentle reminder that Invoice {invoice_number} for {amount} is due on {due_date}, which is coming up soon.\n\nYou can view and pay the invoice here: {payment_link}\n\nIf you have any questions or need more time, please let me know.\n\nBest regards,\n{your_name}`
}, {
  id: 'friendly',
  name: '⏰ Friendly Reminder (Just Due)',
  desc: 'For invoices just past due date',
  subject: 'Payment Reminder: Invoice {invoice_number}',
  body: `Hi {client_name},\n\nI wanted to reach out regarding Invoice {invoice_number} for {amount}, which was due on {due_date}.\n\nI understand things can get busy, so this is just a friendly reminder to process the payment when you get a chance.\n\nPayment Link: {payment_link}\n\nThank you!\n{your_name}`
}, {
  id: 'overdue',
  name: '📅 Payment Overdue (7-15 days)',
  desc: 'For invoices 1-2 weeks overdue',
  subject: 'Overdue Payment: Invoice {invoice_number}',
  body: `Dear {client_name},\n\nThis is a reminder that Invoice {invoice_number} for {amount} is now {days_overdue} days overdue.\n\nPlease arrange payment as soon as possible. If there are any issues with the invoice, please contact me immediately.\n\nPayment Link: {payment_link}\n\nThank you for your prompt attention.\n{your_name}`
}, {
  id: 'urgent',
  name: '⚠️ Urgent: Payment Required',
  desc: 'For invoices 2-4 weeks overdue',
  subject: 'URGENT: Overdue Invoice {invoice_number} - Payment Required',
  body: `Dear {client_name},\n\nI am writing regarding Invoice {invoice_number} for {amount}, which is now {days_overdue} days overdue.\n\nDespite previous reminders, we have not received payment. We require immediate payment to avoid additional late fees or service suspension.\n\nPayment Link: {payment_link}\n\n{your_name}`
}, {
  id: 'final',
  name: '🚨 Final Notice (30+ days)',
  desc: 'For invoices over 1 month overdue',
  subject: 'FINAL NOTICE: Invoice {invoice_number} - Immediate Action Required',
  body: `Dear {client_name},\n\nThis is our final notice regarding Invoice {invoice_number} for {amount}.\n\nIf full payment is not received within 7 business days, we will be forced to initiate collection proceedings.\n\nPayment Link: {payment_link}\n\nThis is a serious matter requiring your immediate attention.\n{your_name}`
}, {
  id: 'custom',
  name: '💬 Custom Message',
  desc: 'Write your own reminder',
  subject: 'Regarding Invoice {invoice_number}',
  body: `Hi {client_name},\n\n[Write your message here]\n\nInvoice: {invoice_number}\nAmount: {amount}\n\nLink: {payment_link}\n\nThanks,\n{your_name}`
}];
// Mock Invoices for Selection
const MOCK_INVOICES = [{
  id: '1',
  number: 'INV-045',
  client: 'Tech Solutions',
  amount: 10000,
  date: 'Feb 15, 2026',
  overdue: 5,
  status: 'overdue'
}, {
  id: '2',
  number: 'INV-042',
  client: 'Global Services',
  amount: 15000,
  date: 'Jan 30, 2026',
  overdue: 11,
  status: 'overdue'
}, {
  id: '3',
  number: 'INV-048',
  client: 'Alpha Corp',
  amount: 5000,
  date: 'Feb 20, 2026',
  overdue: 0,
  status: 'pending'
}];
export function PaymentReminder({
  isOpen,
  onClose,
  preselectedInvoices
}: PaymentReminderProps) {
  const [step, setStep] = useState(1); // 1: Edit, 2: Success
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>(preselectedInvoices || []);
  const [showInvoicePicker, setShowInvoicePicker] = useState(!preselectedInvoices);
  // Form State
  const [templateId, setTemplateId] = useState('friendly');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  // Delivery State
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(false);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  // Schedule State
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachPDF, setAttachPDF] = useState(true);
  const [ccMe, setCcMe] = useState(false);
  const [logActivity, setLogActivity] = useState(true);
  // UI State
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  // Initialize template
  useEffect(() => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setSubject(tmpl.subject);
      setMessage(tmpl.body);
    }
  }, [templateId]);
  // Auto-select template based on overdue days
  useEffect(() => {
    if (selectedInvoices.length > 0) {
      const maxOverdue = Math.max(...selectedInvoices.map(i => i.overdue || 0));
      if (maxOverdue > 30) setTemplateId('final');else if (maxOverdue > 15) setTemplateId('urgent');else if (maxOverdue > 7) setTemplateId('overdue');else if (maxOverdue > 0) setTemplateId('friendly');else setTemplateId('gentle');
    }
  }, [selectedInvoices]);
  const toggleInvoice = (invoice: any) => {
    if (selectedInvoices.find(i => i.id === invoice.id)) {
      setSelectedInvoices(selectedInvoices.filter(i => i.id !== invoice.id));
    } else {
      setSelectedInvoices([...selectedInvoices, invoice]);
    }
  };
  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep(2); // Success screen
    }, 2000);
  };
  const getPreviewText = (text: string) => {
    // Simple mock replacement for preview
    return text.replace(/{client_name}/g, selectedInvoices[0]?.client || 'Client Name').replace(/{invoice_number}/g, selectedInvoices.map(i => i.number).join(', ') || 'INV-XXX').replace(/{amount}/g, selectedInvoices.length === 1 ? formatINR(selectedInvoices[0].amount) : 'Total Amount').replace(/{due_date}/g, selectedInvoices[0]?.date || 'Date').replace(/{days_overdue}/g, String(selectedInvoices[0]?.overdue || 0)).replace(/{payment_link}/g, 'trustopay.link/pay/xxx').replace(/{your_name}/g, 'Arjun Mehta');
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col max-w-[430px] mx-auto" data-id="element-1837">
      {/* Success Screen */}
      {step === 2 ? <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white" data-id="element-1838">
          <motion.div initial={{
        scale: 0
      }} animate={{
        scale: 1
      }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6" data-id="element-1839">
            <Check size={40} strokeWidth={3} data-id="element-1840" />
          </motion.div>
          <h2 className="text-2xl font-bold text-trustopay-navy mb-2 text-center" data-id="element-1841">
            Reminders Sent!
          </h2>
          <p className="text-gray-500 text-center mb-8" data-id="element-1842">
            Sent to {selectedInvoices.length} client
            {selectedInvoices.length !== 1 ? 's' : ''} via{' '}
            {sendViaEmail ? 'Email' : ''}
            {sendViaSMS ? sendViaEmail ? ' & SMS' : 'SMS' : ''}.
          </p>
          <div className="w-full space-y-3" data-id="element-1843">
            <Button className="w-full" onClick={onClose} data-id="element-1844">
              Done
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setStep(1)} data-id="element-1845">
              Send Another
            </Button>
          </div>
        </div> : <>
          {/* Header */}
          <div className="bg-white px-5 pt-12 pb-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between" data-id="element-1846">
            <div className="flex items-center gap-3" data-id="element-1847">
              <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors" data-id="element-1848">
                <ArrowLeft size={24} className="text-trustopay-navy" data-id="element-1849" />
              </button>
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-1850">
                Send Reminder
              </h2>
            </div>
            <Button size="sm" className="px-4" disabled={selectedInvoices.length === 0 || !sendViaEmail && !sendViaSMS && !sendViaWhatsApp} onClick={handleSend} data-id="element-1851">
              {isSending ? <Loader2 size={16} className="animate-spin" data-id="element-1852" /> : 'Send'}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-32" data-id="element-1853">
            {/* 1. Select Invoices */}
            <div className="space-y-3" data-id="element-1854">
              <div className="flex justify-between items-center" data-id="element-1855">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1856">
                  SELECT INVOICES
                </p>
                <button onClick={() => setShowInvoicePicker(!showInvoicePicker)} className="text-xs font-medium text-trustopay-purple" data-id="element-1857">
                  {showInvoicePicker ? 'Hide List' : 'Change Selection'}
                </button>
              </div>

              {showInvoicePicker ? <div className="space-y-2" data-id="element-1858">
                  {MOCK_INVOICES.map(inv => {
              const isSelected = selectedInvoices.find(i => i.id === inv.id);
              return <div key={inv.id} onClick={() => toggleInvoice(inv)} className={cn('p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-colors', isSelected ? 'border-trustopay-purple bg-purple-50' : 'border-gray-200 bg-white')} data-id="element-1859">
                        <div className={cn('w-5 h-5 rounded border flex items-center justify-center transition-colors', isSelected ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-1860">
                          {isSelected && <Check size={12} className="text-white" data-id="element-1861" />}
                        </div>
                        <div className="flex-1" data-id="element-1862">
                          <div className="flex justify-between" data-id="element-1863">
                            <span className="font-bold text-sm text-trustopay-navy" data-id="element-1864">
                              {inv.number} • {inv.client}
                            </span>
                            <span className="font-bold text-sm text-trustopay-navy" data-id="element-1865">
                              {formatINR(inv.amount)}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1" data-id="element-1866">
                            <span className="text-xs text-gray-500" data-id="element-1867">
                              Due: {inv.date}
                            </span>
                            {inv.overdue > 0 && <span className="text-xs font-medium text-red-500" data-id="element-1868">
                                {inv.overdue} days overdue
                              </span>}
                          </div>
                        </div>
                      </div>;
            })}
                </div> : <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center" data-id="element-1869">
                  <span className="text-sm font-medium text-gray-700" data-id="element-1870">
                    {selectedInvoices.length} invoices selected
                  </span>
                  <span className="text-xs text-gray-500" data-id="element-1871">
                    Total:{' '}
                    {formatINR(selectedInvoices.reduce((sum, i) => sum + i.amount, 0))}
                  </span>
                </div>}
            </div>

            {/* 2. Reminder Template */}
            <div className="space-y-3" data-id="element-1872">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1873">
                CHOOSE REMINDER TYPE
              </p>
              <div className="relative" data-id="element-1874">
                <select value={templateId} onChange={e => setTemplateId(e.target.value)} className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-1875">
                  {TEMPLATES.map(t => <option key={t.id} value={t.id} data-id="element-1876">
                      {t.name}
                    </option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} data-id="element-1877" />
              </div>
              <p className="text-xs text-gray-500 px-1" data-id="element-1878">
                {TEMPLATES.find(t => t.id === templateId)?.desc}
              </p>
            </div>

            {/* 3. Message Preview */}
            <div className="space-y-3" data-id="element-1879">
              <div className="flex justify-between items-center" data-id="element-1880">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1881">
                  MESSAGE PREVIEW
                </p>
                <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-medium text-trustopay-purple" data-id="element-1882">
                  {isEditing ? 'Done Editing' : 'Edit Message'}
                </button>
              </div>

              <div className="space-y-2" data-id="element-1883">
                <Input label="Subject" value={isEditing ? subject : getPreviewText(subject)} onChange={e => setSubject(e.target.value)} readOnly={!isEditing} className={cn(!isEditing && 'bg-gray-50 text-gray-600 border-gray-200')} data-id="element-1884" />

                <div className="relative" data-id="element-1885">
                  <textarea value={isEditing ? message : getPreviewText(message)} onChange={e => setMessage(e.target.value)} readOnly={!isEditing} className={cn('w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple min-h-[200px] resize-none leading-relaxed', isEditing ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50 text-gray-600')} data-id="element-1886" />
                </div>
              </div>
            </div>

            {/* 4. Delivery Method */}
            <div className="space-y-3" data-id="element-1887">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1888">
                SEND VIA
              </p>
              <div className="space-y-2" data-id="element-1889">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50" data-id="element-1890">
                  <div className="flex items-center gap-3" data-id="element-1891">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600" data-id="element-1892">
                      <Mail size={16} data-id="element-1893" />
                    </div>
                    <div data-id="element-1894">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1895">
                        Email
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1896">
                        Free • Professional format
                      </p>
                    </div>
                  </div>
                  <div className={cn('w-5 h-5 rounded border flex items-center justify-center transition-colors', sendViaEmail ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-1897">
                    {sendViaEmail && <Check size={12} className="text-white" data-id="element-1898" />}
                    <input type="checkbox" className="hidden" checked={sendViaEmail} onChange={() => setSendViaEmail(!sendViaEmail)} data-id="element-1899" />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50" data-id="element-1900">
                  <div className="flex items-center gap-3" data-id="element-1901">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600" data-id="element-1902">
                      <Smartphone size={16} data-id="element-1903" />
                    </div>
                    <div data-id="element-1904">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1905">
                        SMS
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1906">
                        10 credits remaining
                      </p>
                    </div>
                  </div>
                  <div className={cn('w-5 h-5 rounded border flex items-center justify-center transition-colors', sendViaSMS ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300 bg-white')} data-id="element-1907">
                    {sendViaSMS && <Check size={12} className="text-white" data-id="element-1908" />}
                    <input type="checkbox" className="hidden" checked={sendViaSMS} onChange={() => setSendViaSMS(!sendViaSMS)} data-id="element-1909" />
                  </div>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed" data-id="element-1910">
                  <div className="flex items-center gap-3" data-id="element-1911">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600" data-id="element-1912">
                      <MessageCircle size={16} data-id="element-1913" />
                    </div>
                    <div data-id="element-1914">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1915">
                        WhatsApp
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1916">Coming Soon</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded border border-gray-300 bg-white" data-id="element-1917" />
                </label>
              </div>
            </div>

            {/* 5. Schedule */}
            <div className="space-y-3" data-id="element-1918">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-id="element-1919">
                WHEN TO SEND
              </p>
              <div className="bg-white p-1 rounded-xl border border-gray-200 flex" data-id="element-1920">
                <button onClick={() => setScheduleType('now')} className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-colors', scheduleType === 'now' ? 'bg-trustopay-purple text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50')} data-id="element-1921">
                  Send Now
                </button>
                <button onClick={() => setScheduleType('later')} className={cn('flex-1 py-2 text-sm font-medium rounded-lg transition-colors', scheduleType === 'later' ? 'bg-trustopay-purple text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50')} data-id="element-1922">
                  Schedule for Later
                </button>
              </div>

              {scheduleType === 'later' && <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2" data-id="element-1923">
                  <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} data-id="element-1924" />
                  <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} data-id="element-1925" />
                </div>}
            </div>

            {/* 6. Advanced Options */}
            <div className="border-t border-gray-100 pt-4" data-id="element-1926">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-trustopay-purple transition-colors" data-id="element-1927">
                {showAdvanced ? <ChevronUp size={16} data-id="element-1928" /> : <ChevronDown size={16} data-id="element-1929" />}
                Advanced Options
              </button>

              {showAdvanced && <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2" data-id="element-1930">
                  <div className="flex items-center justify-between" data-id="element-1931">
                    <div data-id="element-1932">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1933">
                        Attach Invoice PDF
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1934">
                        Include PDF in email
                      </p>
                    </div>
                    <button onClick={() => setAttachPDF(!attachPDF)} className={cn('w-10 h-5 rounded-full p-0.5 transition-colors duration-200', attachPDF ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1935">
                      <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', attachPDF ? 'translate-x-5' : 'translate-x-0')} data-id="element-1936" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-1937">
                    <div data-id="element-1938">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1939">
                        CC Yourself
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1940">
                        Send copy to your email
                      </p>
                    </div>
                    <button onClick={() => setCcMe(!ccMe)} className={cn('w-10 h-5 rounded-full p-0.5 transition-colors duration-200', ccMe ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1941">
                      <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', ccMe ? 'translate-x-5' : 'translate-x-0')} data-id="element-1942" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between" data-id="element-1943">
                    <div data-id="element-1944">
                      <p className="text-sm font-medium text-trustopay-navy" data-id="element-1945">
                        Log Activity
                      </p>
                      <p className="text-xs text-gray-500" data-id="element-1946">
                        Add to invoice timeline
                      </p>
                    </div>
                    <button onClick={() => setLogActivity(!logActivity)} className={cn('w-10 h-5 rounded-full p-0.5 transition-colors duration-200', logActivity ? 'bg-trustopay-purple' : 'bg-gray-200')} data-id="element-1947">
                      <div className={cn('w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200', logActivity ? 'translate-x-5' : 'translate-x-0')} data-id="element-1948" />
                    </button>
                  </div>
                </div>}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-5 bg-white border-t border-gray-100 absolute bottom-0 left-0 right-0 flex gap-3" data-id="element-1949">
            <Button variant="outline" className="flex-1" onClick={() => setShowPreview(true)} data-id="element-1950">
              Preview Email
            </Button>
            <Button className="flex-[2]" onClick={handleSend} disabled={selectedInvoices.length === 0 || !sendViaEmail && !sendViaSMS} data-id="element-1951">
              {isSending ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" data-id="element-1952" /> Sending...
                </> : `Send Reminder${selectedInvoices.length > 1 ? `s (${selectedInvoices.length})` : ''}`}
            </Button>
          </div>
        </>}

      {/* Email Preview Modal */}
      <AnimatePresence data-id="element-1953">
        {showPreview && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} className="fixed inset-0 z-[60] bg-white flex flex-col" data-id="element-1954">
            <div className="px-5 pt-12 pb-4 border-b border-gray-100 flex items-center justify-between" data-id="element-1955">
              <h2 className="font-bold text-lg text-trustopay-navy" data-id="element-1956">
                Email Preview
              </h2>
              <button onClick={() => setShowPreview(false)} className="p-2 -mr-2 hover:bg-gray-100 rounded-full" data-id="element-1957">
                <X size={24} className="text-gray-500" data-id="element-1958" />
              </button>
            </div>

            <div className="flex justify-center py-3 bg-gray-50 border-b border-gray-200" data-id="element-1959">
              <div className="bg-white rounded-lg border border-gray-200 p-1 flex" data-id="element-1960">
                <button onClick={() => setPreviewMode('desktop')} className={cn('px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5', previewMode === 'desktop' ? 'bg-gray-100 text-trustopay-navy' : 'text-gray-500 hover:text-gray-700')} data-id="element-1961">
                  💻 Desktop
                </button>
                <button onClick={() => setPreviewMode('mobile')} className={cn('px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5', previewMode === 'mobile' ? 'bg-gray-100 text-trustopay-navy' : 'text-gray-500 hover:text-gray-700')} data-id="element-1962">
                  📱 Mobile
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 flex justify-center" data-id="element-1963">
              <div className={cn('bg-white shadow-sm transition-all duration-300 flex flex-col', previewMode === 'desktop' ? 'w-full max-w-2xl rounded-lg my-4' : 'w-[320px] h-[600px] rounded-[30px] border-[8px] border-gray-800 my-4 overflow-hidden')} data-id="element-1964">
                {/* Email Header */}
                <div className="border-b border-gray-100 p-4 bg-gray-50" data-id="element-1965">
                  <div className="text-xs text-gray-500 space-y-1" data-id="element-1966">
                    <p data-id="element-1967">
                      <span className="font-medium text-gray-700" data-id="element-1968">From:</span>{' '}
                      Arjun Mehta &lt;arjun@trustopay.com&gt;
                    </p>
                    <p data-id="element-1969">
                      <span className="font-medium text-gray-700" data-id="element-1970">To:</span>{' '}
                      {selectedInvoices[0]?.client || 'Client Name'}
                    </p>
                    <p data-id="element-1971">
                      <span className="font-medium text-gray-700" data-id="element-1972">
                        Subject:
                      </span>{' '}
                      {getPreviewText(subject)}
                    </p>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 flex-1 overflow-y-auto" data-id="element-1973">
                  <div className="flex items-center gap-2 mb-6" data-id="element-1974">
                    <div className="w-8 h-8 bg-trustopay-purple rounded-lg flex items-center justify-center text-white font-bold text-xs" data-id="element-1975">
                      TP
                    </div>
                    <span className="font-bold text-trustopay-navy" data-id="element-1976">
                      Trustopay
                    </span>
                  </div>

                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans" data-id="element-1977">
                    {getPreviewText(message).split('Payment Link:')[0]}
                  </div>

                  <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-100" data-id="element-1978">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2" data-id="element-1979">
                      Invoice Details
                    </p>
                    <div className="space-y-1 text-sm" data-id="element-1980">
                      <div className="flex justify-between" data-id="element-1981">
                        <span className="text-gray-600" data-id="element-1982">Amount Due:</span>
                        <span className="font-bold text-trustopay-navy" data-id="element-1983">
                          {formatINR(selectedInvoices[0]?.amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between" data-id="element-1984">
                        <span className="text-gray-600" data-id="element-1985">Due Date:</span>
                        <span className="font-medium" data-id="element-1986">
                          {selectedInvoices[0]?.date || 'Date'}
                        </span>
                      </div>
                      <div className="flex justify-between" data-id="element-1987">
                        <span className="text-gray-600" data-id="element-1988">Invoice No:</span>
                        <span className="font-medium" data-id="element-1989">
                          {selectedInvoices[0]?.number || 'INV-XXX'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center my-6" data-id="element-1990">
                    <button className="bg-trustopay-purple text-white px-6 py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-opacity-90" data-id="element-1991">
                      View & Pay Invoice
                    </button>
                  </div>

                  <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed font-sans" data-id="element-1992">
                    {getPreviewText(message).split('Thank you!')[1] || 'Thank you,\nArjun Mehta'}
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400" data-id="element-1993">
                    <p data-id="element-1994">Powered by Trustopay Invoicing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white flex gap-3" data-id="element-1995">
              <Button variant="outline" className="flex-1" onClick={() => setShowPreview(false)} data-id="element-1996">
                Close
              </Button>
              <Button className="flex-1" onClick={() => {
            setShowPreview(false);
            handleSend();
          }} data-id="element-1997">
                Send Now
              </Button>
            </div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}