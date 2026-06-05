import React, { useEffect, useState, useRef } from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown, Clock, Check, ChevronDown, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
// Types
export interface FilterState {
  statuses: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  amountQuick: string | null;
  dateQuick: string | null;
  clients: string[];
}
export interface SortOption {
  key: string;
  label: string;
}
interface SearchFilterSystemProps {
  type: 'invoice' | 'quotation';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortKey: string;
  onSortChange: (key: string) => void;
  resultCount: number;
  totalCount: number;
  statusOptions: {
    value: string;
    label: string;
  }[];
  sortOptions: SortOption[];
  clientOptions: string[];
}
const AMOUNT_QUICK = [{
  key: 'lt5k',
  label: '< ₹5K',
  min: null,
  max: 5000
}, {
  key: '5k-10k',
  label: '₹5K–₹10K',
  min: 5000,
  max: 10000
}, {
  key: '10k-50k',
  label: '₹10K–₹50K',
  min: 10000,
  max: 50000
}, {
  key: 'gt50k',
  label: '> ₹50K',
  min: 50000,
  max: null
}];
const DATE_QUICK = [{
  key: 'today',
  label: 'Today'
}, {
  key: 'week',
  label: 'This Week'
}, {
  key: 'month',
  label: 'This Month'
}, {
  key: 'year',
  label: 'This Year'
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
export function SearchFilterSystem({
  type,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortKey,
  onSortChange,
  resultCount,
  totalCount,
  statusOptions,
  sortOptions,
  clientOptions
}: SearchFilterSystemProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([type === 'invoice' ? 'Tech Solutions' : 'Creative Studio', type === 'invoice' ? 'INV-045' : 'QUO-001', 'Overdue', 'February 2026']);
  // Draft filter state for the panel (only applied on "Apply")
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);
  const [clientSearch, setClientSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setDraftFilters(filters);
  }, [showFilterPanel]);
  const activeFilterCount = filters.statuses.length + (filters.amountQuick ? 1 : filters.amountRange.min || filters.amountRange.max ? 1 : 0) + (filters.dateQuick ? 1 : 0) + filters.clients.length;
  const hasActiveFilters = activeFilterCount > 0;
  const isFiltered = hasActiveFilters || searchQuery.length > 0;
  const handleSearchSubmit = () => {
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
    }
    setIsSearchFocused(false);
    searchRef.current?.blur();
  };
  const handleRecentSearch = (term: string) => {
    onSearchChange(term);
    setIsSearchFocused(false);
    searchRef.current?.blur();
  };
  const clearSearch = () => {
    onSearchChange('');
    searchRef.current?.focus();
  };
  const applyFilters = () => {
    onFiltersChange(draftFilters);
    setShowFilterPanel(false);
  };
  const clearAllFilters = () => {
    onFiltersChange(emptyFilters);
    setShowFilterPanel(false);
  };
  const removeFilter = (type: string, value?: string) => {
    const updated = {
      ...filters
    };
    switch (type) {
      case 'status':
        updated.statuses = updated.statuses.filter(s => s !== value);
        break;
      case 'amount':
        updated.amountQuick = null;
        updated.amountRange = {
          min: null,
          max: null
        };
        break;
      case 'date':
        updated.dateQuick = null;
        break;
      case 'client':
        updated.clients = updated.clients.filter(c => c !== value);
        break;
    }
    onFiltersChange(updated);
  };
  const toggleDraftStatus = (status: string) => {
    setDraftFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status) ? prev.statuses.filter(s => s !== status) : [...prev.statuses, status]
    }));
  };
  const toggleDraftClient = (client: string) => {
    setDraftFilters(prev => ({
      ...prev,
      clients: prev.clients.includes(client) ? prev.clients.filter(c => c !== client) : [...prev.clients, client]
    }));
  };
  // Build active filter badges
  const filterBadges: {
    label: string;
    type: string;
    value?: string;
  }[] = [];
  filters.statuses.forEach(s => {
    const opt = statusOptions.find(o => o.value === s);
    filterBadges.push({
      label: opt?.label || s,
      type: 'status',
      value: s
    });
  });
  if (filters.amountQuick) {
    const aq = AMOUNT_QUICK.find(a => a.key === filters.amountQuick);
    filterBadges.push({
      label: aq?.label || '',
      type: 'amount'
    });
  }
  if (filters.dateQuick) {
    const dq = DATE_QUICK.find(d => d.key === filters.dateQuick);
    filterBadges.push({
      label: dq?.label || '',
      type: 'date'
    });
  }
  filters.clients.forEach(c => {
    filterBadges.push({
      label: c,
      type: 'client',
      value: c
    });
  });
  const filteredClients = clientOptions.filter(c => c.toLowerCase().includes(clientSearch.toLowerCase()));
  const entityLabel = type === 'invoice' ? 'invoices' : 'quotations';
  return <>
      {/* Search Bar + Filter/Sort Buttons */}
      <div className="flex gap-2 items-center" data-id="element-2990">
        <div className="flex-1 relative" data-id="element-2991">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" data-id="element-2992" />
          <input ref={searchRef} type="text" value={searchQuery} onChange={e => onSearchChange(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} placeholder={`Search ${entityLabel}, clients...`} className="w-full h-10 pl-9 pr-9 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-trustopay-purple focus:border-transparent focus:bg-white transition-all" data-id="element-2993" />
          {searchQuery && <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" data-id="element-2994">
              <X size={16} data-id="element-2995" />
            </button>}
        </div>

        {/* Filter Button */}
        <button onClick={() => setShowFilterPanel(true)} className={cn('h-10 px-3 rounded-lg border flex items-center gap-1.5 text-sm font-medium transition-all flex-shrink-0', hasActiveFilters ? 'border-trustopay-purple bg-purple-50 text-trustopay-purple' : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100')} data-id="element-2996">
          <SlidersHorizontal size={15} data-id="element-2997" />
          {hasActiveFilters && <span className="w-5 h-5 rounded-full bg-trustopay-purple text-white text-[10px] font-bold flex items-center justify-center" data-id="element-2998">
              {activeFilterCount}
            </span>}
        </button>

        {/* Sort Button */}
        <button onClick={() => setShowSortPanel(true)} className="h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center gap-1.5 text-sm font-medium transition-all flex-shrink-0" data-id="element-2999">
          <ArrowUpDown size={15} data-id="element-3000" />
        </button>
      </div>

      {/* Recent Searches Dropdown */}
      <AnimatePresence data-id="element-3001">
        {isSearchFocused && !searchQuery && recentSearches.length > 0 && <motion.div initial={{
        opacity: 0,
        y: -4
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -4
      }} transition={{
        duration: 0.15
      }} className="bg-white rounded-lg border border-gray-100 shadow-lg mt-1 overflow-hidden" data-id="element-3002">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-50" data-id="element-3003">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider" data-id="element-3004">
                Recent Searches
              </span>
              <button onMouseDown={e => {
            e.preventDefault();
            setRecentSearches([]);
          }} className="text-[10px] text-gray-400 hover:text-red-500" data-id="element-3005">
                Clear
              </button>
            </div>
            {recentSearches.map((term, i) => <button key={i} onMouseDown={e => {
          e.preventDefault();
          handleRecentSearch(term);
        }} className="w-full px-3 py-2.5 flex items-center gap-2.5 hover:bg-gray-50 text-left transition-colors" data-id="element-3006">
                <Clock size={13} className="text-gray-300 flex-shrink-0" data-id="element-3007" />
                <span className="text-sm text-gray-600" data-id="element-3008">{term}</span>
              </button>)}
          </motion.div>}
      </AnimatePresence>

      {/* Active Filter Badges */}
      {filterBadges.length > 0 && <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1" data-id="element-3009">
          {filterBadges.map((badge, i) => <motion.button key={`${badge.type}-${badge.value || badge.label}-${i}`} initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} onClick={() => removeFilter(badge.type, badge.value)} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-trustopay-purple text-white text-[10px] font-medium whitespace-nowrap flex-shrink-0" data-id="element-3010">
              {badge.label}
              <X size={10} data-id="element-3011" />
            </motion.button>)}
          <button onClick={clearAllFilters} className="text-[10px] font-medium text-gray-400 hover:text-red-500 whitespace-nowrap flex-shrink-0 px-1" data-id="element-3012">
            Clear all
          </button>
        </div>}

      {/* Result Count */}
      {isFiltered && <p className="text-[11px] text-gray-400 pt-0.5" data-id="element-3013">
          Showing {resultCount} of {totalCount} {entityLabel}
          {searchQuery && <span data-id="element-3014"> for "{searchQuery}"</span>}
        </p>}

      {/* Empty State */}
      {isFiltered && resultCount === 0 && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-center py-12" data-id="element-3015">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3" data-id="element-3016">
            <Inbox size={24} className="text-gray-400" data-id="element-3017" />
          </div>
          <p className="font-medium text-trustopay-navy mb-1" data-id="element-3018">
            No {entityLabel} found
          </p>
          <p className="text-xs text-gray-400 mb-4 max-w-[220px] mx-auto" data-id="element-3019">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
          <div className="flex gap-2 justify-center" data-id="element-3020">
            {searchQuery && <Button size="sm" variant="outline" onClick={clearSearch} className="text-xs h-8" data-id="element-3021">
                Clear Search
              </Button>}
            {hasActiveFilters && <Button size="sm" variant="outline" onClick={clearAllFilters} className="text-xs h-8" data-id="element-3022">
                Clear Filters
              </Button>}
          </div>
        </motion.div>}

      {/* FILTER PANEL BOTTOM SHEET */}
      <AnimatePresence data-id="element-3023">
        {showFilterPanel && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowFilterPanel(false)} data-id="element-3024" />
            <motion.div initial={{
          y: '100%'
        }} animate={{
          y: 0
        }} exit={{
          y: '100%'
        }} transition={{
          type: 'spring',
          damping: 28,
          stiffness: 300
        }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-w-[430px] mx-auto overflow-hidden flex flex-col" style={{
          maxHeight: '80vh'
        }} data-id="element-3025">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0" data-id="element-3026">
                <h3 className="font-bold text-trustopay-navy text-lg" data-id="element-3027">
                  Filters
                </h3>
                <button onClick={() => setShowFilterPanel(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200" data-id="element-3028">
                  <X size={16} data-id="element-3029" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6" data-id="element-3030">
                {/* STATUS */}
                <div data-id="element-3031">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-3032">
                    Status
                  </p>
                  <div className="space-y-1" data-id="element-3033">
                    {statusOptions.map(opt => <button key={opt.value} onClick={() => toggleDraftStatus(opt.value)} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors" data-id="element-3034">
                        <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all', draftFilters.statuses.includes(opt.value) ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300')} data-id="element-3035">
                          {draftFilters.statuses.includes(opt.value) && <Check size={12} className="text-white" data-id="element-3036" />}
                        </div>
                        <span className="text-sm text-trustopay-navy" data-id="element-3037">
                          {opt.label}
                        </span>
                      </button>)}
                  </div>
                </div>

                {/* AMOUNT RANGE */}
                <div data-id="element-3038">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-3039">
                    Amount Range
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3" data-id="element-3040">
                    {AMOUNT_QUICK.map(aq => <button key={aq.key} onClick={() => setDraftFilters(prev => ({
                  ...prev,
                  amountQuick: prev.amountQuick === aq.key ? null : aq.key,
                  amountRange: prev.amountQuick === aq.key ? {
                    min: null,
                    max: null
                  } : {
                    min: aq.min,
                    max: aq.max
                  }
                }))} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', draftFilters.amountQuick === aq.key ? 'bg-trustopay-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')} data-id="element-3041">
                        {aq.label}
                      </button>)}
                  </div>
                  <div className="flex gap-3" data-id="element-3042">
                    <div className="flex-1" data-id="element-3043">
                      <label className="text-[10px] text-gray-400 mb-1 block" data-id="element-3044">
                        Min (₹)
                      </label>
                      <input type="number" placeholder="0" value={draftFilters.amountRange.min ?? ''} onChange={e => setDraftFilters(prev => ({
                    ...prev,
                    amountQuick: null,
                    amountRange: {
                      ...prev.amountRange,
                      min: e.target.value ? Number(e.target.value) : null
                    }
                  }))} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-3045" />
                    </div>
                    <div className="flex-1" data-id="element-3046">
                      <label className="text-[10px] text-gray-400 mb-1 block" data-id="element-3047">
                        Max (₹)
                      </label>
                      <input type="number" placeholder="Any" value={draftFilters.amountRange.max ?? ''} onChange={e => setDraftFilters(prev => ({
                    ...prev,
                    amountQuick: null,
                    amountRange: {
                      ...prev.amountRange,
                      max: e.target.value ? Number(e.target.value) : null
                    }
                  }))} className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-3048" />
                    </div>
                  </div>
                </div>

                {/* DATE RANGE */}
                <div data-id="element-3049">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-3050">
                    Date Range
                  </p>
                  <div className="flex flex-wrap gap-2" data-id="element-3051">
                    {DATE_QUICK.map(dq => <button key={dq.key} onClick={() => setDraftFilters(prev => ({
                  ...prev,
                  dateQuick: prev.dateQuick === dq.key ? null : dq.key
                }))} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', draftFilters.dateQuick === dq.key ? 'bg-trustopay-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')} data-id="element-3052">
                        {dq.label}
                      </button>)}
                  </div>
                </div>

                {/* CLIENTS */}
                <div data-id="element-3053">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3" data-id="element-3054">
                    Clients
                  </p>
                  <div className="relative mb-2" data-id="element-3055">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" data-id="element-3056" />
                    <input type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)} placeholder="Search clients..." className="w-full h-9 pl-8 pr-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-trustopay-purple" data-id="element-3057" />
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto" data-id="element-3058">
                    {filteredClients.map(client => <button key={client} onClick={() => toggleDraftClient(client)} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" data-id="element-3059">
                        <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-all', draftFilters.clients.includes(client) ? 'bg-trustopay-purple border-trustopay-purple' : 'border-gray-300')} data-id="element-3060">
                          {draftFilters.clients.includes(client) && <Check size={12} className="text-white" data-id="element-3061" />}
                        </div>
                        <span className="text-sm text-trustopay-navy" data-id="element-3062">
                          {client}
                        </span>
                      </button>)}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-white" data-id="element-3063">
                <Button variant="outline" className="flex-1" onClick={() => {
              setDraftFilters(emptyFilters);
            }} data-id="element-3064">
                  Clear All
                </Button>
                <Button className="flex-[2]" onClick={applyFilters} data-id="element-3065">
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>}
      </AnimatePresence>

      {/* SORT PANEL BOTTOM SHEET */}
      <AnimatePresence data-id="element-3066">
        {showSortPanel && <>
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setShowSortPanel(false)} data-id="element-3067" />
            <motion.div initial={{
          y: '100%'
        }} animate={{
          y: 0
        }} exit={{
          y: '100%'
        }} transition={{
          type: 'spring',
          damping: 28,
          stiffness: 300
        }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-w-[430px] mx-auto overflow-hidden" data-id="element-3068">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center" data-id="element-3069">
                <h3 className="font-bold text-trustopay-navy" data-id="element-3070">Sort By</h3>
                <button onClick={() => setShowSortPanel(false)} className="p-1.5 bg-gray-100 rounded-full hover:bg-gray-200" data-id="element-3071">
                  <X size={16} data-id="element-3072" />
                </button>
              </div>
              <div className="p-2" data-id="element-3073">
                {sortOptions.map(opt => <button key={opt.key} onClick={() => {
              onSortChange(opt.key);
              setShowSortPanel(false);
            }} className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors" data-id="element-3074">
                    <span className={cn('text-sm', sortKey === opt.key ? 'font-bold text-trustopay-purple' : 'text-trustopay-navy')} data-id="element-3075">
                      {opt.label}
                    </span>
                    {sortKey === opt.key && <div className="w-5 h-5 rounded-full bg-trustopay-purple flex items-center justify-center" data-id="element-3076">
                        <Check size={12} className="text-white" data-id="element-3077" />
                      </div>}
                  </button>)}
              </div>
            </motion.div>
          </>}
      </AnimatePresence>
    </>;
}