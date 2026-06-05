import React, { useMemo, useState } from 'react';
import { Plus, Calendar, ClipboardList, ArrowUpRight, ArrowDownLeft, Eye, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/StatusBadge';
import { SearchFilterSystem, FilterState } from '../components/SearchFilterSystem';
import { formatINR } from '../lib/utils';
interface Quotation {
  id: string;
  client: string;
  amount: number;
  date: string;
  validUntil: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired' | 'draft' | 'converted';
  version: number;
  type: 'sent' | 'received';
}
const quotations: Quotation[] = [{
  id: 'QUO-001',
  client: 'Tech Solutions Ltd',
  amount: 45000,
  date: 'Oct 20, 2023',
  validUntil: 'Nov 20, 2023',
  status: 'sent',
  version: 1,
  type: 'sent'
}, {
  id: 'QUO-002',
  client: 'Creative Studio',
  amount: 75000,
  date: 'Oct 18, 2023',
  validUntil: 'Nov 18, 2023',
  status: 'accepted',
  version: 1,
  type: 'sent'
}, {
  id: 'QUO-003',
  client: 'Global Services',
  amount: 25000,
  date: 'Oct 15, 2023',
  validUntil: 'Nov 15, 2023',
  status: 'rejected',
  version: 2,
  type: 'sent'
}, {
  id: 'QUO-004',
  client: 'Alpha Corp',
  amount: 120000,
  date: 'Oct 10, 2023',
  validUntil: 'Oct 25, 2023',
  status: 'expired',
  version: 1,
  type: 'sent'
}, {
  id: 'QUO-005',
  client: 'Beta Systems',
  amount: 35000,
  date: 'Oct 22, 2023',
  validUntil: 'Nov 22, 2023',
  status: 'draft',
  version: 1,
  type: 'sent'
}, {
  id: 'QUO-006',
  client: 'Design Hub',
  amount: 55000,
  date: 'Oct 5, 2023',
  validUntil: 'Nov 5, 2023',
  status: 'converted',
  version: 1,
  type: 'sent'
}, {
  id: 'QUO-007',
  client: 'Marketing Pro',
  amount: 28000,
  date: 'Oct 25, 2023',
  validUntil: 'Nov 25, 2023',
  status: 'sent',
  version: 1,
  type: 'received'
}, {
  id: 'QUO-008',
  client: 'Dev Agency',
  amount: 95000,
  date: 'Oct 24, 2023',
  validUntil: 'Nov 24, 2023',
  status: 'accepted',
  version: 1,
  type: 'received'
}];
const quoteTracking: Record<string, {
  status: 'not_viewed' | 'seen';
  label: string;
  time: string;
  views?: number;
}> = {
  'QUO-001': {
    status: 'seen',
    label: 'Viewed 2 times',
    time: 'Oct 21, 3:00 PM',
    views: 2
  },
  'QUO-002': {
    status: 'seen',
    label: 'Viewed by client',
    time: 'Oct 19, 10:30 AM',
    views: 1
  },
  'QUO-003': {
    status: 'seen',
    label: 'Viewed 4 times',
    time: 'Oct 18, 2:00 PM',
    views: 4
  },
  'QUO-004': {
    status: 'seen',
    label: 'Viewed once',
    time: 'Oct 12, 9:00 AM',
    views: 1
  },
  'QUO-005': {
    status: 'not_viewed',
    label: 'Not viewed yet',
    time: ''
  }
};
const QUOTE_STATUS_OPTIONS = [{
  value: 'draft',
  label: 'Draft'
}, {
  value: 'sent',
  label: 'Sent'
}, {
  value: 'accepted',
  label: 'Accepted'
}, {
  value: 'rejected',
  label: 'Rejected'
}, {
  value: 'expired',
  label: 'Expired'
}, {
  value: 'converted',
  label: 'Converted'
}];
const QUOTE_SORT_OPTIONS = [{
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
  key: 'valid-asc',
  label: 'Expiry Date (Soonest)'
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
interface QuotationsPageProps {
  onSelectQuote: (quote: Quotation) => void;
  onCreateQuote: () => void;
}
export function QuotationsPage({
  onSelectQuote,
  onCreateQuote
}: QuotationsPageProps) {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sortKey, setSortKey] = useState('date-desc');
  const clientOptions = useMemo(() => {
    const clients = new Set(quotations.filter(q => q.type === activeTab).map(q => q.client));
    return Array.from(clients);
  }, [activeTab]);
  // Filter + Search + Sort logic
  const filteredQuotes = useMemo(() => {
    let result = quotations.filter(q => q.type === activeTab);
    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(q => q.client.toLowerCase().includes(query) || q.id.toLowerCase().includes(query) || q.amount.toString().includes(query) || q.status.toLowerCase().includes(query) || q.date && q.date.toLowerCase().includes(query));
    }
    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter(q => filters.statuses.includes(q.status));
    }
    // Amount filter
    if (filters.amountRange.min !== null) {
      result = result.filter(q => q.amount >= (filters.amountRange.min ?? 0));
    }
    if (filters.amountRange.max !== null) {
      result = result.filter(q => q.amount <= (filters.amountRange.max ?? Infinity));
    }
    // Client filter
    if (filters.clients.length > 0) {
      result = result.filter(q => filters.clients.includes(q.client));
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
        case 'valid-asc':
          return a.validUntil.localeCompare(b.validUntil);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return result;
  }, [activeTab, searchQuery, filters, sortKey]);
  const totalForTab = quotations.filter(q => q.type === activeTab).length;
  return <div className="flex flex-col min-h-screen bg-trustopay-bg pb-24" data-id="element-4235">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 bg-white sticky top-0 z-10 shadow-sm" data-id="element-4236">
        <div className="flex justify-between items-center mb-4" data-id="element-4237">
          <h1 className="text-2xl font-bold text-trustopay-navy" data-id="element-4238">Quotations</h1>
          <Button size="sm" className="rounded-full px-4" onClick={onCreateQuote} data-id="element-4239">
            <Plus size={18} className="mr-1" data-id="element-4240" /> New
          </Button>
        </div>

        {/* Search + Filter + Sort */}
        <div className="mb-4 space-y-2" data-id="element-4241">
          <SearchFilterSystem type="quotation" searchQuery={searchQuery} onSearchChange={setSearchQuery} filters={filters} onFiltersChange={setFilters} sortKey={sortKey} onSortChange={setSortKey} resultCount={filteredQuotes.length} totalCount={totalForTab} statusOptions={QUOTE_STATUS_OPTIONS} sortOptions={QUOTE_SORT_OPTIONS} clientOptions={clientOptions} data-id="element-4242" />
        </div>

        {/* Main Tabs */}
        <div className="flex border-b border-gray-200 relative" data-id="element-4243">
          <button onClick={() => {
          setActiveTab('sent');
          setSearchQuery('');
          setFilters(emptyFilters);
        }} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'sent' ? 'text-trustopay-purple' : 'text-gray-500'}`} data-id="element-4244">
            Sent
          </button>
          <button onClick={() => {
          setActiveTab('received');
          setSearchQuery('');
          setFilters(emptyFilters);
        }} className={`flex-1 pb-3 text-sm font-medium transition-colors ${activeTab === 'received' ? 'text-trustopay-purple' : 'text-gray-500'}`} data-id="element-4245">
            Received
          </button>
          <motion.div className="absolute bottom-0 h-0.5 bg-trustopay-purple" initial={false} animate={{
          left: activeTab === 'sent' ? '0%' : '50%',
          width: '50%'
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} data-id="element-4246" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4" data-id="element-4247">
        <AnimatePresence mode="wait" data-id="element-4248">
          <motion.div key={`${activeTab}-${sortKey}`} initial={{
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
        }} className="space-y-4" data-id="element-4249">
            {filteredQuotes.map((quote, index) => <motion.div key={quote.id} initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.05
          }} onClick={() => onSelectQuote(quote)} data-id="element-4250">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" data-id="element-4251">
                  <div className="flex items-center gap-3" data-id="element-4252">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${activeTab === 'sent' ? 'bg-purple-50 text-trustopay-purple' : 'bg-teal-50 text-teal-600'}`} data-id="element-4253">
                      {activeTab === 'sent' ? <ArrowUpRight size={20} data-id="element-4254" /> : <ArrowDownLeft size={20} data-id="element-4255" />}
                    </div>
                    <div className="flex-1 min-w-0" data-id="element-4256">
                      <div className="flex justify-between items-start mb-1" data-id="element-4257">
                        <h3 className="font-bold text-trustopay-navy text-sm truncate pr-2" data-id="element-4258">
                          {quote.client}
                        </h3>
                        <p className="text-lg font-bold text-trustopay-navy flex-shrink-0" data-id="element-4259">
                          {formatINR(quote.amount)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mb-1" data-id="element-4260">
                        <div className="flex items-center gap-2" data-id="element-4261">
                          <p className="text-[11px] text-gray-400" data-id="element-4262">
                            #{quote.id} • {quote.date}
                          </p>
                          <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded" data-id="element-4263">
                            v{quote.version}
                          </span>
                        </div>
                        <StatusBadge status={quote.status} data-id="element-4264" />
                      </div>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1" data-id="element-4265">
                        <Calendar size={10} data-id="element-4266" /> Valid until: {quote.validUntil}
                      </p>

                      {/* Read Receipt Tracking Indicator */}
                      {activeTab === 'sent' && quoteTracking[quote.id] && <p className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${quoteTracking[quote.id].status === 'seen' ? 'text-blue-500' : 'text-gray-400'}`} data-id="element-4267">
                          {quoteTracking[quote.id].status === 'seen' ? <Eye size={10} data-id="element-4268" /> : <Send size={10} data-id="element-4269" />}
                          {quoteTracking[quote.id].label}
                          {quoteTracking[quote.id].time && ` • ${quoteTracking[quote.id].time}`}
                        </p>}
                      {activeTab === 'sent' && !quoteTracking[quote.id] && <p className="text-[10px] mt-1 flex items-center gap-1 text-gray-400" data-id="element-4270">
                          <Send size={10} data-id="element-4271" /> Not viewed yet
                        </p>}
                    </div>
                  </div>

                  {/* Quick Actions for Received Quotes */}
                  {activeTab === 'received' && quote.status === 'sent' && <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3" data-id="element-4272">
                      <button className="flex-1 text-xs font-semibold text-red-500 hover:text-red-700 py-1" onClick={e => {
                  e.stopPropagation();
                }} data-id="element-4273">
                        Reject
                      </button>
                      <div className="w-px bg-gray-100" data-id="element-4274" />
                      <button className="flex-1 text-xs font-bold text-green-600 hover:text-green-700 py-1" onClick={e => {
                  e.stopPropagation();
                }} data-id="element-4275">
                        Accept Quote
                      </button>
                    </div>}
                </Card>
              </motion.div>)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>;
}