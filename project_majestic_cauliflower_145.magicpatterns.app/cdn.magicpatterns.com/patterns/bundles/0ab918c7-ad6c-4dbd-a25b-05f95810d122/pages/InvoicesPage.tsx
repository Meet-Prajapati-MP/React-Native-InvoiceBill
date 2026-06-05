import React, { useMemo, useState } from 'react';
import { Plus, Calendar, ArrowUpRight, ArrowDownLeft, RefreshCw, Pause, Play, AlertCircle, Eye, Link2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/StatusBadge';
import { SearchFilterSystem, FilterState } from '../components/SearchFilterSystem';
import { formatINR } from '../lib/utils';
interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'sent' | 'received';
}
const invoices: Invoice[] = [{
  id: '1',
  number: 'INV-001',
  client: 'Tech Solutions Ltd',
  amount: 10000,
  date: 'Oct 24, 2023',
  dueDate: 'Nov 24, 2023',
  status: 'pending',
  type: 'sent'
}, {
  id: '2',
  number: 'INV-002',
  client: 'Creative Studio',
  amount: 25000,
  date: 'Oct 20, 2023',
  dueDate: 'Nov 20, 2023',
  status: 'paid',
  type: 'sent'
}, {
  id: '3',
  number: 'INV-003',
  client: 'Global Services',
  amount: 5000,
  date: 'Oct 15, 2023',
  dueDate: 'Oct 30, 2023',
  status: 'overdue',
  type: 'sent'
}, {
  id: '4',
  number: 'INV-004',
  client: 'Alpha Corp',
  amount: 12500,
  date: 'Oct 25, 2023',
  dueDate: 'Nov 25, 2023',
  status: 'pending',
  type: 'received'
}, {
  id: '5',
  number: 'INV-005',
  client: 'Beta Systems',
  amount: 8000,
  date: 'Oct 22, 2023',
  dueDate: 'Nov 22, 2023',
  status: 'paid',
  type: 'received'
}];
const invoiceTracking: Record<string, {
  status: 'not_viewed' | 'seen' | 'link_clicked';
  label: string;
  time: string;
  views?: number;
}> = {
  '1': {
    status: 'link_clicked',
    label: 'Payment link opened',
    time: 'Feb 6, 11:00 AM'
  },
  '2': {
    status: 'seen',
    label: 'Viewed by client',
    time: 'Oct 21, 2:30 PM',
    views: 2
  },
  '3': {
    status: 'seen',
    label: 'Viewed 3 times',
    time: 'Feb 8, 4:00 PM',
    views: 3
  }
};
const recurringInvoices = [{
  id: 'REC-001',
  client: 'Tech Solutions Ltd',
  amount: 10000,
  frequency: 'monthly',
  nextDate: 'Nov 24, 2023',
  status: 'active',
  totalGenerated: 3,
  type: 'sent'
}, {
  id: 'REC-002',
  client: 'Creative Studio',
  amount: 25000,
  frequency: 'quarterly',
  nextDate: 'Jan 20, 2024',
  status: 'active',
  totalGenerated: 1,
  type: 'sent'
}, {
  id: 'REC-003',
  client: 'Global Services',
  amount: 5000,
  frequency: 'weekly',
  nextDate: 'Nov 1, 2023',
  status: 'paused',
  totalGenerated: 8,
  type: 'sent'
}, {
  id: 'REC-004',
  client: 'Hosting Provider',
  amount: 2000,
  frequency: 'monthly',
  nextDate: 'Nov 05, 2023',
  status: 'active',
  totalGenerated: 12,
  type: 'received'
}] as const;
const INVOICE_STATUS_OPTIONS = [{
  value: 'paid',
  label: 'Paid'
}, {
  value: 'pending',
  label: 'Pending'
}, {
  value: 'overdue',
  label: 'Overdue'
}];
const INVOICE_SORT_OPTIONS = [{
  key: 'date-desc',
  label: 'Date (Newest First)'
}, {
  key: 'date-asc',
  label: 'Date (Oldest First)'
}, {
  key: 'amount-desc',
  label: 'Amount (High to Low)'
}, {
  key: 'amount-asc',
  label: 'Amount (Low to High)'
}, {
  key: 'client-asc',
  label: 'Client Name (A–Z)'
}, {
  key: 'due-asc',
  label: 'Due Date (Soonest First)'
}, {
  key: 'status',
  label: 'Status'
}];
const emptyFilters: FilterState = {
  statuses: [],
  amountRange: {
    min: null,
    max: null
  },
  amountQuick: null,
  dateQuick: null,
  clients: []
};
interface InvoicesPageProps {
  onSelectInvoice: (invoice: Invoice) => void;
  onSelectRecurring?: (recurring: any) => void;
  onAction: (invoice: Invoice, action: 'discount' | 'pay') => void;
  onCreateInvoice: () => void;
}
export function InvoicesPage({
  onSelectInvoice,
  onSelectRecurring,
  onAction,
  onCreateInvoice
}: InvoicesPageProps) {
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'recurring'>('sent');
  const [recurringSubTab, setRecurringSubTab] = useState<'all' | 'sent' | 'received'>('all');
  const [showPauseConfirm, setShowPauseConfirm] = useState<string | null>(null);
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sortKey, setSortKey] = useState('date-desc');
  const clientOptions = useMemo(() => {
    const clients = new Set(invoices.filter(i => i.type === activeTab).map(i => i.client));
    return Array.from(clients);
  }, [activeTab]);
  // Filter + Search + Sort logic
  const filteredInvoices = useMemo(() => {
    let result = invoices.filter(inv => inv.type === activeTab);
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => inv.client.toLowerCase().includes(q) || inv.number.toLowerCase().includes(q) || inv.amount.toString().includes(q) || inv.status.toLowerCase().includes(q) || inv.date && inv.date.toLowerCase().includes(q));
    }
    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(inv => filters.statuses.includes(inv.status));
    }
    // Amount filter
    if (filters.amountRange.min !== null) {
      result = result.filter(inv => inv.amount >= (filters.amountRange.min ?? 0));
    }
    if (filters.amountRange.max !== null) {
      result = result.filter(inv => inv.amount <= (filters.amountRange.max ?? Infinity));
    }
    // Client filter
    if (filters.clients.length > 0) {
      result = result.filter(inv => filters.clients.includes(inv.client));
    }
    // Sort
    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'date-desc':
          return b.date.localeCompare(a.date);
        case 'date-asc':
          return a.date.localeCompare(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'client-asc':
          return a.client.localeCompare(b.client);
        case 'due-asc':
          return (a.dueDate || '').localeCompare(b.dueDate || '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return result;
  }, [activeTab, searchQuery, filters, sortKey]);
  const totalForTab = invoices.filter(inv => inv.type === activeTab).length;
  const filteredRecurring = recurringInvoices.filter(rec => {
    if (recurringSubTab === 'all') return true;
    return rec.type === recurringSubTab;
  });
  const handlePauseToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const rec = recurringInvoices.find(r => r.id === id);
    if (rec?.status === 'active') {
      setShowPauseConfirm(id);
    }
  };
  return <div className="flex flex-col min-h-screen bg-trustopay-bg pb-24" data-id="element-3867">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 shadow-sm" data-id="element-3868">
        <div className="flex justify-between items-center mb-4" data-id="element-3869">
          <h1 className="text-2xl font-bold text-trustopay-navy" data-id="element-3870">Invoices</h1>
          <Button size="sm" className="rounded-full px-4" onClick={onCreateInvoice} data-id="element-3871">
            <Plus size={18} className="mr-1" data-id="element-3872" /> New
          </Button>
        </div>

        {/* Search + Filter + Sort */}
        {activeTab !== 'recurring' && <div className="mb-4 space-y-2" data-id="element-3873">
            <SearchFilterSystem type="invoice" searchQuery={searchQuery} onSearchChange={setSearchQuery} filters={filters} onFiltersChange={setFilters} sortKey={sortKey} onSortChange={setSortKey} resultCount={filteredInvoices.length} totalCount={totalForTab} statusOptions={INVOICE_STATUS_OPTIONS} sortOptions={INVOICE_SORT_OPTIONS} clientOptions={clientOptions} data-id="element-3874" />
          </div>}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 relative" data-id="element-3875">
          <button onClick={() => {
          setActiveTab('sent');
          setSearchQuery('');
          setFilters(emptyFilters);
        }} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'sent' ? 'text-trustopay-purple' : 'text-gray-500'}`} data-id="element-3876">
            Sent
          </button>
          <button onClick={() => {
          setActiveTab('received');
          setSearchQuery('');
          setFilters(emptyFilters);
        }} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'received' ? 'text-trustopay-purple' : 'text-gray-500'}`} data-id="element-3877">
            Received
          </button>
          <button onClick={() => {
          setActiveTab('recurring');
          setSearchQuery('');
          setFilters(emptyFilters);
        }} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'recurring' ? 'text-trustopay-purple' : 'text-gray-500'}`} data-id="element-3878">
            Recurring
          </button>
          <motion.div className="absolute bottom-0 h-0.5 bg-trustopay-purple" initial={false} animate={{
          left: activeTab === 'sent' ? '0%' : activeTab === 'received' ? '33.33%' : '66.66%',
          width: '33.33%'
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} data-id="element-3879" />
        </div>

        {/* Recurring Sub-tabs */}
        {activeTab === 'recurring' && <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar" data-id="element-3880">
            {['all', 'sent', 'received'].map(subTab => <button key={subTab} onClick={() => setRecurringSubTab(subTab as any)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${recurringSubTab === subTab ? 'bg-trustopay-purple text-white' : 'bg-gray-100 text-gray-600'}`} data-id="element-3881">
                {subTab}
              </button>)}
          </div>}
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4" data-id="element-3882">
        <AnimatePresence mode="wait" data-id="element-3883">
          {activeTab === 'recurring' ? <motion.div key="recurring" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.2
        }} className="space-y-4" data-id="element-3884">
              {filteredRecurring.map((rec, index) => <motion.div key={rec.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} onClick={() => onSelectRecurring && onSelectRecurring(rec)} data-id="element-3885">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" data-id="element-3886">
                    <div className="flex items-center gap-3 mb-3" data-id="element-3887">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${rec.type === 'sent' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`} data-id="element-3888">
                        {rec.type === 'sent' ? <ArrowUpRight size={20} data-id="element-3889" /> : <ArrowDownLeft size={20} data-id="element-3890" />}
                      </div>
                      <div className="flex-1 min-w-0" data-id="element-3891">
                        <div className="flex justify-between items-start mb-1" data-id="element-3892">
                          <h3 className="font-bold text-trustopay-navy text-sm truncate pr-2" data-id="element-3893">
                            {rec.client}
                          </h3>
                          <p className="text-lg font-bold text-trustopay-navy flex-shrink-0" data-id="element-3894">
                            {formatINR(rec.amount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center" data-id="element-3895">
                          <div className="flex items-center gap-2" data-id="element-3896">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full" data-id="element-3897">
                              {rec.frequency}
                            </span>
                            <span className="text-[10px] text-gray-400 flex items-center gap-1" data-id="element-3898">
                              <Calendar size={10} data-id="element-3899" /> Next: {rec.nextDate}
                            </span>
                          </div>
                          <StatusBadge status={rec.status as any} data-id="element-3900" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 flex gap-3" data-id="element-3901">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={e => handlePauseToggle(rec.id, e)} data-id="element-3902">
                        {rec.status === 'active' ? <>
                            <Pause size={14} data-id="element-3903" /> Pause
                          </> : <>
                            <Play size={14} data-id="element-3904" /> Resume
                          </>}
                      </button>
                      <div className="w-px bg-gray-100" data-id="element-3905" />
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-trustopay-purple hover:bg-purple-50 rounded-lg transition-colors" onClick={e => {
                  e.stopPropagation();
                  if (onSelectRecurring) onSelectRecurring(rec);
                }} data-id="element-3906">
                        Edit Template
                      </button>
                    </div>
                  </Card>
                </motion.div>)}
              {filteredRecurring.length === 0 && <div className="text-center py-12 text-gray-400" data-id="element-3907">
                  No {recurringSubTab !== 'all' ? recurringSubTab : ''}{' '}
                  recurring invoices found.
                </div>}
            </motion.div> : <motion.div key={activeTab} initial={{
          opacity: 0,
          x: activeTab === 'sent' ? -20 : 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: activeTab === 'sent' ? 20 : -20
        }} transition={{
          duration: 0.2
        }} className="space-y-4" data-id="element-3908">
              {filteredInvoices.map((invoice, index) => <motion.div key={invoice.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} onClick={() => onSelectInvoice(invoice)} data-id="element-3909">
                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" data-id="element-3910">
                    <div className="flex items-center gap-3" data-id="element-3911">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === 'sent' ? 'bg-purple-50' : 'bg-green-50'}`} data-id="element-3912">
                        {activeTab === 'sent' ? <ArrowUpRight size={20} className="text-trustopay-purple" data-id="element-3913" /> : <ArrowDownLeft size={20} className="text-green-600" data-id="element-3914" />}
                      </div>
                      <div className="flex-1 min-w-0" data-id="element-3915">
                        <div className="flex justify-between items-start mb-1" data-id="element-3916">
                          <h3 className="font-bold text-trustopay-navy text-sm truncate pr-2" data-id="element-3917">
                            {invoice.client}
                          </h3>
                          <p className="text-lg font-bold text-trustopay-navy flex-shrink-0" data-id="element-3918">
                            {formatINR(invoice.amount)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center" data-id="element-3919">
                          <p className="text-[11px] text-gray-400" data-id="element-3920">
                            #{invoice.number} • {invoice.date}
                          </p>
                          <StatusBadge status={invoice.status} data-id="element-3921" />
                        </div>
                        {invoice.dueDate && <p className={`text-[10px] mt-1 flex items-center gap-1 ${invoice.status === 'overdue' ? 'text-red-500 font-medium' : 'text-gray-400'}`} data-id="element-3922">
                            <Calendar size={10} data-id="element-3923" /> Due: {invoice.dueDate}
                          </p>}
                        {activeTab === 'sent' && invoiceTracking[invoice.id] && <p className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${invoiceTracking[invoice.id].status === 'link_clicked' ? 'text-orange-500' : invoiceTracking[invoice.id].status === 'seen' ? 'text-blue-500' : 'text-gray-400'}`} data-id="element-3924">
                              {invoiceTracking[invoice.id].status === 'link_clicked' ? <Link2 size={10} data-id="element-3925" /> : invoiceTracking[invoice.id].status === 'seen' ? <Eye size={10} data-id="element-3926" /> : <Send size={10} data-id="element-3927" />}
                              {invoiceTracking[invoice.id].label} •{' '}
                              {invoiceTracking[invoice.id].time}
                            </p>}
                        {activeTab === 'sent' && !invoiceTracking[invoice.id] && <p className="text-[10px] mt-1 flex items-center gap-1 text-gray-400" data-id="element-3928">
                              <Send size={10} data-id="element-3929" /> Not viewed yet
                            </p>}
                      </div>
                    </div>
                    {activeTab === 'sent' && invoice.status === 'pending' && <div className="mt-3 pt-3 border-t border-gray-100" data-id="element-3930">
                        <button className="text-xs font-semibold text-trustopay-purple hover:text-purple-700" onClick={e => e.stopPropagation()} data-id="element-3931">
                          Send Reminder →
                        </button>
                      </div>}
                    {activeTab === 'received' && invoice.status !== 'paid' && <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end" data-id="element-3932">
                        <Button size="sm" className="h-8" onClick={e => {
                  e.stopPropagation();
                  onAction(invoice, 'pay');
                }} data-id="element-3933">
                          Pay Now
                        </Button>
                      </div>}
                  </Card>
                </motion.div>)}
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Pause Confirmation Modal */}
      <AnimatePresence data-id="element-3934">
        {showPauseConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPauseConfirm(null)} data-id="element-3935">
            <motion.div initial={{
          scale: 0.95,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} exit={{
          scale: 0.95,
          opacity: 0
        }} className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()} data-id="element-3936">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4" data-id="element-3937">
                <Pause size={24} className="text-amber-600" data-id="element-3938" />
              </div>
              <h3 className="text-lg font-bold text-center text-trustopay-navy mb-2" data-id="element-3939">
                Pause Recurring Invoice?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6" data-id="element-3940">
                This will stop future invoices from being generated
                automatically. You can resume this later.
              </p>
              <div className="flex gap-3" data-id="element-3941">
                <Button variant="outline" className="flex-1" onClick={() => setShowPauseConfirm(null)} data-id="element-3942">
                  Cancel
                </Button>
                <Button className="flex-1 bg-amber-500 hover:bg-amber-600" onClick={() => setShowPauseConfirm(null)} data-id="element-3943">
                  Pause
                </Button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}