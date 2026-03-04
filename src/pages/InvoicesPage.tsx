import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import {
  FilterPanel,
  SortPanel,
  FilterState,
  emptyFilters,
  AMOUNT_QUICK,
  DATE_QUICK,
} from '../components/FilterSystem';
import { AnimatedSection } from '../components/AnimatedSection';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'sent' | 'received';
  activity?: string;
  activityIcon?: 'link' | 'eye';
  customerEmail?: string;
  customerPhone?: string;
}

interface RecurringInvoice {
  id: string;
  client: string;
  amount: number;
  frequency: string;
  nextDate: string;
  status: 'active' | 'paused';
  type: 'sent' | 'received';
  number: string;
  date: string;
}

function formatDateShort(d: string | null): string {
  if (!d) return '';
  const x = new Date(d);
  return isNaN(x.getTime()) ? '' : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toInvoice(raw: Record<string, unknown>): Invoice {
  const cust = raw.customers as { name?: string; email?: string; phone?: string } | undefined;
  const client = cust?.name ?? (raw.client_name as string) ?? 'Unknown';
  const itemsRaw = raw.invoice_items;
  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
  const computedAmount = items.reduce((s: number, i: unknown) => {
    const item = i as Record<string, unknown>;
    const qty = Math.max(0, parseInt(String(item?.qty ?? 1), 10) || 1);
    const rate = parseFloat(String(item?.rate ?? 0)) || 0;
    return s + qty * rate;
  }, 0);
  const amount = typeof raw.amount === 'number' ? raw.amount : (typeof raw.amount === 'string' ? parseFloat(raw.amount) || computedAmount : computedAmount);
  const type = (raw.type as string) || 'sent';
  return {
    id: String(raw.id ?? ''),
    number: String(raw.number ?? ''),
    client,
    amount: Number.isFinite(amount) ? amount : computedAmount,
    date: formatDateShort((raw.invoice_date as string) ?? (raw.created_at as string)),
    dueDate: formatDateShort(raw.due_date as string),
    status: ((raw.status as string) || 'pending') as Invoice['status'],
    type: (type === 'received' ? 'received' : 'sent') as Invoice['type'],
    customerEmail: cust?.email,
    customerPhone: cust?.phone,
  };
}

function toRecurringInvoice(raw: {
  id: string;
  number?: string;
  client_name?: string;
  amount?: number;
  next_date?: string;
  start_date?: string;
  created_at?: string;
  status?: string;
  type?: string;
  frequency?: string;
  customers?: { name?: string } | null;
}): RecurringInvoice {
  const cust = raw.customers as { name?: string } | undefined;
  const client = raw.client_name ?? cust?.name ?? 'Unknown';
  const items = (raw as { recurring_invoice_items?: { qty?: number; rate?: number }[] }).recurring_invoice_items ?? [];
  const amount = raw.amount ?? items.reduce((s, i) => s + (Number(i.qty) || 1) * (Number(i.rate) || 0), 0);
  return {
    id: raw.id,
    number: raw.number ?? '',
    client,
    amount,
    nextDate: formatDateShort(raw.next_date),
    date: formatDateShort(raw.start_date ?? raw.created_at),
    status: (raw.status as RecurringInvoice['status']) || 'active',
    type: (raw.type as RecurringInvoice['type']) || 'sent',
    frequency: raw.frequency ?? 'MONTHLY',
  };
}

type MainTab = 'sent' | 'received' | 'recurring';
type RecurringFilter = 'all' | 'sent' | 'received';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

const SORT_OPTIONS = [
  { key: 'date-asc', label: 'Date (Oldest first)' },
  { key: 'date-desc', label: 'Date (Newest first)' },
  { key: 'amount-desc', label: 'Amount (High to Low)' },
  { key: 'amount-asc', label: 'Amount (Low to High)' },
  { key: 'client', label: 'Client Name (A–Z)' },
];

const CLIENT_OPTIONS = [
  'Tech Solutions Ltd',
  'Creative Studio',
  'Global Services',
  'Alpha Corp',
  'Beta Systems',
  'Hosting Provider',
];

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function matchesDateQuick(dateStr: string, key: string | null): boolean {
  if (!key) return true;
  const d = parseDate(dateStr);
  if (!d) return true;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const yearAgo = new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (key === 'today') return dateOnly.getTime() === today.getTime();
  if (key === 'week') return dateOnly >= weekAgo && dateOnly <= now;
  if (key === 'month') return dateOnly >= monthAgo && dateOnly <= now;
  if (key === 'year') return dateOnly >= yearAgo && dateOnly <= now;
  return true;
}

function matchesAmountFilters(amount: number, filters: FilterState): boolean {
  const { amountRange, amountQuick } = filters;
  let min = amountRange.min;
  let max = amountRange.max;
  if (amountQuick) {
    const aq = AMOUNT_QUICK.find((a) => a.key === amountQuick);
    if (aq) {
      min = aq.min;
      max = aq.max;
    }
  }
  if (min != null && amount < min) return false;
  if (max != null && amount > max) return false;
  return true;
}

interface InvoicesPageProps {
  onCreateInvoice: () => void;
  onSelectInvoice: (inv: Invoice | RecurringInvoice) => void;
  refreshKey?: number;
}

export function InvoicesPage({ onCreateInvoice, onSelectInvoice, refreshKey = 0 }: InvoicesPageProps) {
  const [sentInvoices, setSentInvoices] = useState<Invoice[]>([]);
  const [receivedInvoices, setReceivedInvoices] = useState<Invoice[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [mainTab, setMainTab] = useState<MainTab>('sent');
  const [recurringFilter, setRecurringFilter] = useState<RecurringFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sortKey, setSortKey] = useState('date-asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const extractList = (res: unknown): unknown[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === 'object') {
      const o = res as Record<string, unknown>;
      if (Array.isArray(o.data)) return o.data;
      if (Array.isArray(o.invoices)) return o.invoices;
    }
    return [];
  };

  const fetchInvoices = useCallback(async () => {
    try {
      setFetchError(null);
      const { data } = await api.get<unknown>(`/invoices?_=${Date.now()}`);
      const raw = extractList(data);
      const list = raw.map((r) => toInvoice(r as Record<string, unknown>));
      const sent = list.filter((i) => i.type === 'sent');
      const received = list.filter((i) => i.type === 'received');
      setSentInvoices(sent);
      setReceivedInvoices(received);
      if (__DEV__ && list.length > 0) console.log('[InvoicesPage] Loaded', list.length, 'invoices');
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err as { message?: string })?.message
        ?? 'Could not load invoices';
      setFetchError(msg);
      setSentInvoices([]);
      setReceivedInvoices([]);
      if (__DEV__) console.warn('[InvoicesPage] Failed to fetch invoices:', err);
    }
  }, []);

  const fetchRecurringInvoices = useCallback(async () => {
    try {
      const { data } = await api.get<unknown>(`/recurring-invoices?_=${Date.now()}`);
      const raw = extractList(data);
      const list = raw.map((r) => toRecurringInvoice(r as Record<string, unknown>));
      setRecurringInvoices(list);
    } catch {
      setRecurringInvoices([]);
    }
  }, []);

  const doFetch = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchInvoices(), fetchRecurringInvoices()]);
    setLoading(false);
  }, [fetchInvoices, fetchRecurringInvoices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await doFetch();
    setRefreshing(false);
  }, [doFetch]);

  useEffect(() => {
    doFetch();
  }, [doFetch, refreshKey]);

  const getStatusStyle = (status: string) => {
    if (status === 'paid') return { bg: colors.green100, text: colors.green600 };
    if (status === 'overdue') return { bg: colors.red50, text: colors.red500 };
    return { bg: '#FEF3C7', text: '#B45309' }; // amber/yellow for pending
  };

  const getRecurringStatusStyle = (status: string) => {
    if (status === 'active') return { bg: colors.green100, text: colors.green600 };
    return { bg: colors.orange50, text: colors.amber500 }; // paused
  };

  const applyFiltersAndSort = useMemo(() => {
    const bySearch = (inv: { client: string; number?: string }) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        inv.client.toLowerCase().includes(q) ||
        (inv.number?.toLowerCase().includes(q) ?? false)
      );
    };
    const byFilterStatus = (status: string) => {
      if (filters.statuses.length === 0) return true;
      return filters.statuses.includes(status);
    };
    const byFilterClient = (client: string) => {
      if (filters.clients.length === 0) return true;
      return filters.clients.includes(client);
    };
    const sortFn = (a: Invoice | RecurringInvoice, b: Invoice | RecurringInvoice) => {
      const dateStr = (x: Invoice | RecurringInvoice) =>
        'date' in x ? x.date : (x as RecurringInvoice).nextDate;
      const amt = (x: Invoice | RecurringInvoice) => x.amount;
      const name = (x: Invoice | RecurringInvoice) => x.client;
      const da = parseDate(dateStr(a))?.getTime() ?? 0;
      const db = parseDate(dateStr(b))?.getTime() ?? 0;
      if (sortKey === 'date-desc') return db - da;
      if (sortKey === 'date-asc') return da - db;
      if (sortKey === 'amount-desc') return amt(b) - amt(a);
      if (sortKey === 'amount-asc') return amt(a) - amt(b);
      if (sortKey === 'client') return name(a).localeCompare(name(b));
      return db - da;
    };
    let sent = sentInvoices.filter(
      (inv) =>
        bySearch(inv) &&
        byFilterStatus(inv.status) &&
        byFilterClient(inv.client) &&
        matchesAmountFilters(inv.amount, filters) &&
        matchesDateQuick(inv.date, filters.dateQuick)
    );
    let received = receivedInvoices.filter(
      (inv) =>
        bySearch(inv) &&
        byFilterStatus(inv.status) &&
        byFilterClient(inv.client) &&
        matchesAmountFilters(inv.amount, filters) &&
        matchesDateQuick(inv.date, filters.dateQuick)
    );
    let recurring = recurringInvoices.filter((r) => {
      if (recurringFilter !== 'all' && r.type !== recurringFilter) return false;
      if (!bySearch(r)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(r.status))
        return false;
      if (filters.clients.length > 0 && !filters.clients.includes(r.client))
        return false;
      if (!matchesAmountFilters(r.amount, filters)) return false;
      return matchesDateQuick(r.nextDate, filters.dateQuick);
    });
    sent = [...sent].sort(sortFn);
    received = [...received].sort(sortFn);
    recurring = [...recurring].sort(sortFn);
    return { sent, received, recurring };
  }, [
    sentInvoices,
    receivedInvoices,
    recurringInvoices,
    searchQuery,
    filters,
    sortKey,
    recurringFilter,
  ]);

  const { sent: filteredSent, received: filteredReceived, recurring: filteredRecurringList } = applyFiltersAndSort;

  const activeFilterCount =
    filters.statuses.length +
    (filters.amountQuick ? 1 : filters.amountRange.min != null || filters.amountRange.max != null ? 1 : 0) +
    (filters.dateQuick ? 1 : 0) +
    filters.clients.length;
  const hasActiveFilters = activeFilterCount > 0;
  const isFiltered = hasActiveFilters || searchQuery.length > 0;

  const filterBadges: { label: string; type: string; value?: string }[] = [];
  filters.statuses.forEach((s) => {
    const opt = STATUS_OPTIONS.find((o) => o.value === s);
    filterBadges.push({ label: opt?.label || s, type: 'status', value: s });
  });
  if (filters.amountQuick) {
    const aq = AMOUNT_QUICK.find((a) => a.key === filters.amountQuick);
    filterBadges.push({ label: aq?.label || '', type: 'amount' });
  }
  if (filters.dateQuick) {
    const dq = DATE_QUICK.find((d) => d.key === filters.dateQuick);
    filterBadges.push({ label: dq?.label || '', type: 'date' });
  }
  filters.clients.forEach((c) => {
    filterBadges.push({ label: c, type: 'client', value: c });
  });

  const removeFilter = (type: string, value?: string) => {
    const updated = { ...filters };
    if (type === 'status') updated.statuses = updated.statuses.filter((s) => s !== value);
    if (type === 'amount') {
      updated.amountQuick = null;
      updated.amountRange = { min: null, max: null };
    }
    if (type === 'date') updated.dateQuick = null;
    if (type === 'client') updated.clients = updated.clients.filter((c) => c !== value);
    setFilters(updated);
  };

  const getResultCount = () => {
    if (mainTab === 'sent') return filteredSent.length;
    if (mainTab === 'received') return filteredReceived.length;
    return filteredRecurringList.length;
  };
  const getTotalCount = () => {
    if (mainTab === 'sent') return sentInvoices.length;
    if (mainTab === 'received') return receivedInvoices.length;
    return recurringInvoices.filter(
      (r) => recurringFilter === 'all' || r.type === recurringFilter
    ).length;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <TouchableOpacity onPress={onCreateInvoice} style={styles.newBtn}>
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.gray400} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search invoices, clients..."
            placeholderTextColor={colors.gray400}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowFilterPanel(true)}
          style={[styles.iconBtn, hasActiveFilters && styles.iconBtnActive]}
        >
          <Ionicons
            name="filter"
            size={18}
            color={hasActiveFilters ? colors.purple : colors.gray600}
          />
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowSortPanel(true)}
          style={styles.iconBtn}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.gray600} />
        </TouchableOpacity>
      </View>

      {/* Filter Badges */}
      {filterBadges.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesScroll}
          contentContainerStyle={styles.badgesContent}
        >
          {filterBadges.map((badge, i) => (
            <TouchableOpacity
              key={`${badge.type}-${badge.value ?? badge.label}-${i}`}
              onPress={() => removeFilter(badge.type, badge.value)}
              style={styles.filterBadgePill}
            >
              <Text style={styles.filterBadgePillText}>{badge.label}</Text>
              <Ionicons name="close" size={10} color={colors.white} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setFilters(emptyFilters)} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Result Count */}
      {isFiltered && (
        <Text style={styles.resultCount}>
          Showing {getResultCount()} of {getTotalCount()} invoices
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </Text>
      )}

      {/* Main Tabs */}
      <View style={styles.tabs}>
        {(['sent', 'received', 'recurring'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setMainTab(tab)}
            style={styles.tab}
          >
            <Text style={[styles.tabText, mainTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {mainTab === tab && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Recurring Sub-pills */}
      {mainTab === 'recurring' && (
        <View style={styles.subPills}>
          {(['all', 'sent', 'received'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setRecurringFilter(filter)}
              style={[
                styles.subPill,
                recurringFilter === filter && styles.subPillActive,
              ]}
            >
              <Text
                style={[
                  styles.subPillText,
                  recurringFilter === filter && styles.subPillTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {fetchError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.purple} />
          <Text style={styles.loadingText}>Loading invoices...</Text>
        </View>
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.purple]}
            tintColor={colors.purple}
          />
        }
      >
        {mainTab === 'sent' && !isFiltered && filteredSent.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No Invoices Yet</Text>
            <Text style={styles.emptySub}>Tap New to create your first invoice</Text>
          </View>
        )}
        {mainTab === 'sent' &&
          filteredSent.map((inv, i) => (
            <AnimatedSection key={inv.id} index={i} delay={0}>
            <SentInvoiceCard
              invoice={inv}
              getStatusStyle={getStatusStyle}
              onPress={() => onSelectInvoice(inv)}
            />
            </AnimatedSection>
          ))}

        {mainTab === 'received' && !isFiltered && filteredReceived.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No Invoices Yet</Text>
            <Text style={styles.emptySub}>Tap New to create your first invoice</Text>
          </View>
        )}
        {mainTab === 'received' &&
          filteredReceived.map((inv, i) => (
            <AnimatedSection key={inv.id} index={i} delay={0}>
            <ReceivedInvoiceCard
              invoice={inv}
              getStatusStyle={getStatusStyle}
              onPress={() => onSelectInvoice(inv)}
            />
            </AnimatedSection>
          ))}

        {mainTab === 'recurring' && !isFiltered && filteredRecurringList.length === 0 && !loading && (
          <View style={styles.emptyWrap}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No Recurring Invoices Yet</Text>
            <Text style={styles.emptySub}>Create recurring invoices to see them here</Text>
          </View>
        )}
        {mainTab === 'sent' && isFiltered && filteredSent.length === 0 && (
          <View style={styles.emptyFiltered}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyFilteredTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
            <View style={styles.emptyActions}>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setSearchQuery('')}
                  style={styles.emptyBtn}
                >
                  Clear Search
                </Button>
              )}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setFilters(emptyFilters)}
                  style={styles.emptyBtn}
                >
                  Clear Filters
                </Button>
              )}
            </View>
          </View>
        )}
        {mainTab === 'received' && isFiltered && filteredReceived.length === 0 && (
          <View style={styles.emptyFiltered}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyFilteredTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
            <View style={styles.emptyActions}>
              {searchQuery && (
                <Button variant="outline" size="sm" onPress={() => setSearchQuery('')} style={styles.emptyBtn}>
                  Clear Search
                </Button>
              )}
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onPress={() => setFilters(emptyFilters)} style={styles.emptyBtn}>
                  Clear Filters
                </Button>
              )}
            </View>
          </View>
        )}
        {mainTab === 'recurring' && isFiltered && filteredRecurringList.length === 0 && (
          <View style={styles.emptyFiltered}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyFilteredTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
          </View>
        )}
        {mainTab === 'recurring' &&
          filteredRecurringList.map((inv, i) => (
            <AnimatedSection key={inv.id} index={i} delay={0}>
            <RecurringInvoiceCard
              invoice={inv}
              getRecurringStatusStyle={getRecurringStatusStyle}
              onPress={() => onSelectInvoice(inv)}
              onPauseResume={() => {}}
              onEditTemplate={() => {}}
            />
            </AnimatedSection>
          ))}

        <View style={{ height: 120 }} />
      </ScrollView>
      )}

      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onFiltersChange={setFilters}
        statusOptions={STATUS_OPTIONS}
        clientOptions={CLIENT_OPTIONS}
      />
      <SortPanel
        isOpen={showSortPanel}
        onClose={() => setShowSortPanel(false)}
        sortKey={sortKey}
        onSortChange={setSortKey}
        sortOptions={SORT_OPTIONS}
      />
    </View>
  );
}

function SentInvoiceCard({
  invoice,
  getStatusStyle,
  onPress,
}: {
  invoice: Invoice;
  getStatusStyle: (s: string) => { bg: string; text: string };
  onPress: () => void;
}) {
  const sc = getStatusStyle(invoice.status);
  const isOverdue = invoice.status === 'overdue';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <View style={[styles.cardIcon, styles.cardIconPurple]}>
          <Ionicons name="trending-up" size={18} color={colors.purple} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{invoice.client}</Text>
          <Text style={styles.metaText}>#{invoice.number} • {invoice.date}</Text>
          <View style={styles.dueRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.gray500} />
            <Text style={[styles.dueText, isOverdue && styles.dueOverdue]}>
              Due: {invoice.dueDate}
            </Text>
          </View>
          {invoice.activity && (
            <View style={styles.activityRow}>
              <Ionicons
                name={invoice.activityIcon === 'eye' ? 'eye-outline' : 'link-outline'}
                size={12}
                color={colors.gray500}
              />
              <Text style={styles.activityText}>{invoice.activity}</Text>
            </View>
          )}
          {invoice.status === 'pending' && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onPress();
              }}
              style={styles.sendReminderBtn}
            >
              <Text style={styles.sendReminderText}>Send Reminder</Text>
              <Ionicons name="arrow-forward" size={12} color={colors.purple} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatINR(invoice.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusBadgeText, { color: sc.text }]}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ReceivedInvoiceCard({
  invoice,
  getStatusStyle,
  onPress,
}: {
  invoice: Invoice;
  getStatusStyle: (s: string) => { bg: string; text: string };
  onPress: () => void;
}) {
  const sc = getStatusStyle(invoice.status);
  const isOverdue = invoice.status === 'overdue';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <View style={[styles.cardIcon, styles.cardIconGreen]}>
          <Ionicons name="arrow-down" size={18} color={colors.green600} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{invoice.client}</Text>
          <Text style={styles.metaText}>#{invoice.number} • {invoice.date}</Text>
          <View style={styles.dueRow}>
            <Ionicons name="calendar-outline" size={12} color={colors.gray500} />
            <Text style={[styles.dueText, isOverdue && styles.dueOverdue]}>
              Due: {invoice.dueDate}
            </Text>
          </View>
          {invoice.status === 'pending' && (
            <Button onPress={onPress} size="sm" style={styles.payNowBtn}>
              Pay Now
            </Button>
          )}
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatINR(invoice.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusBadgeText, { color: sc.text }]}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecurringInvoiceCard({
  invoice,
  getRecurringStatusStyle,
  onPress,
  onPauseResume,
  onEditTemplate,
}: {
  invoice: RecurringInvoice;
  getRecurringStatusStyle: (s: string) => { bg: string; text: string };
  onPress: () => void;
  onPauseResume: () => void;
  onEditTemplate: () => void;
}) {
  const sc = getRecurringStatusStyle(invoice.status);
  const isOutgoing = invoice.type === 'sent';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardRow}>
        <View
          style={[
            styles.cardIcon,
            isOutgoing ? styles.cardIconBlue : styles.cardIconGreen,
          ]}
        >
          <Ionicons
            name={isOutgoing ? 'trending-up' : 'trending-down'}
            size={18}
            color={isOutgoing ? colors.blue600 : colors.green600}
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.clientName}>{invoice.client}</Text>
          <View style={styles.recurringMetaRow}>
            <View style={styles.freqPill}>
              <Text style={styles.freqPillText}>{invoice.frequency}</Text>
            </View>
            <View style={styles.nextRow}>
              <Ionicons name="calendar-outline" size={12} color={colors.gray500} />
              <Text style={styles.nextText}>Next: {invoice.nextDate}</Text>
            </View>
          </View>
          <View style={styles.recurringActions}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onPauseResume();
              }}
              style={styles.actionLink}
            >
              <Ionicons
                name={invoice.status === 'active' ? 'pause' : 'play'}
                size={14}
                color={colors.gray700}
              />
              <Text style={styles.actionLinkText}>
                {invoice.status === 'active' ? 'Pause' : 'Resume'}
              </Text>
            </TouchableOpacity>
            <View style={styles.actionDivider} />
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEditTemplate();
              }}
              style={styles.actionLink}
            >
              <Text style={styles.actionLinkText}>Edit Template</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatINR(invoice.amount)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusBadgeText, { color: sc.text }]}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.navy,
    padding: 0,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: colors.purple50,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  badgesScroll: { maxHeight: 36 },
  badgesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.purple,
  },
  filterBadgePillText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.white,
  },
  clearAllBtn: { padding: 4 },
  clearAllText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray400,
  },
  resultCount: {
    fontSize: 11,
    color: colors.gray500,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  tab: {
    flex: 1,
    paddingBottom: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray500,
  },
  tabTextActive: {
    color: colors.navy,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.purple,
    borderRadius: 1,
  },
  subPills: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  subPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.gray100,
  },
  subPillActive: {
    backgroundColor: colors.purple,
  },
  subPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray600,
  },
  subPillTextActive: {
    color: colors.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.red50,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red100,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.red600,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red600,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.gray500,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardIconPurple: { backgroundColor: colors.purple100 },
  cardIconGreen: { backgroundColor: colors.green100 },
  cardIconBlue: { backgroundColor: colors.blue100 },
  cardContent: { flex: 1, minWidth: 0 },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 4,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dueText: { fontSize: 12, color: colors.gray500 },
  dueOverdue: { color: colors.red500 },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  activityText: { fontSize: 12, color: colors.gray500 },
  sendReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sendReminderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple,
  },
  payNowBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  cardRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recurringMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  freqPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.gray100,
  },
  freqPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray600,
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextText: { fontSize: 12, color: colors.gray500 },
  recurringActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray700,
  },
  actionDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.gray300,
    marginHorizontal: 8,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyImage: { width: 220, height: 220, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  emptySub: { fontSize: 15, color: colors.gray500 },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray500,
  },
  emptyFilteredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 4,
  },
  emptyFiltered: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 220,
  },
  emptyActions: { flexDirection: 'row', gap: 8 },
  emptyBtn: { marginHorizontal: 4 },
});
