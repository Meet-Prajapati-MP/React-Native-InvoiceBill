import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { AnimatedSection } from '../components/AnimatedSection';
import {
  FilterPanel,
  SortPanel,
  FilterState,
  emptyFilters,
  AMOUNT_QUICK,
  DATE_QUICK,
} from '../components/FilterSystem';

interface Quotation {
  id: string;
  quoNumber: string;
  client: string;
  amount: number;
  date: string;
  dateRaw: string;
  version: string;
  validUntil: string;
  viewStatus: string;
  status: 'converted' | 'draft' | 'sent' | 'accepted' | 'rejected';
  type: 'sent' | 'received';
}

function formatDateShort(d: string | null): string {
  if (!d) return '';
  const x = new Date(d);
  return isNaN(x.getTime()) ? '' : x.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function toQuotation(raw: {
  id: string;
  quo_number: string;
  client_name?: string;
  amount: number;
  date?: string;
  created_at?: string;
  valid_until?: string;
  view_status?: string;
  version?: string;
  status: string;
  type: string;
  customers?: { name?: string } | null;
}): Quotation {
  const client = raw.client_name ?? (raw.customers as { name?: string })?.name ?? 'Unknown';
  const dateRaw = raw.date ?? raw.created_at ?? '';
  return {
    id: raw.id,
    quoNumber: raw.quo_number,
    client,
    amount: Number(raw.amount) || 0,
    date: formatDateShort(dateRaw || null),
    dateRaw,
    validUntil: formatDateShort(raw.valid_until),
    version: raw.version || 'v1',
    viewStatus: raw.view_status || 'Not viewed yet',
    status: (raw.status as Quotation['status']) || 'draft',
    type: (raw.type as Quotation['type']) || 'sent',
  };
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
];

const SORT_OPTIONS = [
  { key: 'date-asc', label: 'Date (Oldest first)' },
  { key: 'date-desc', label: 'Date (Newest first)' },
  { key: 'amount-desc', label: 'Amount (High to Low)' },
  { key: 'amount-asc', label: 'Amount (Low to High)' },
  { key: 'client', label: 'Client Name (A–Z)' },
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

interface QuotationsPageProps {
  onCreateQuote: () => void;
  onSelectQuote: (q: Quotation) => void;
  refreshKey?: number;
}

export function QuotationsPage({ onCreateQuote, onSelectQuote, refreshKey = 0 }: QuotationsPageProps) {
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [searchQuery, setSearchQuery] = useState('');
  const [sentQuotations, setSentQuotations] = useState<Quotation[]>([]);
  const [receivedQuotations, setReceivedQuotations] = useState<Quotation[]>([]);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [sortKey, setSortKey] = useState('date-asc');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const lastFetchedRefreshKeyRef = useRef<number>(-1);
  const hasLoadedOnceRef = useRef(false);

  const fetchQuotations = useCallback(async () => {
    try {
      const { data } = await api.get<unknown[]>(`/quotations?_=${Date.now()}`);
      const list = Array.isArray(data) ? data.map((r: any) => toQuotation(r)) : [];
      const sent = list.filter((q) => q.type === 'sent');
      const received = list.filter((q) => q.type === 'received');
      setSentQuotations(sent);
      setReceivedQuotations(received);
    } catch {
      setSentQuotations([]);
      setReceivedQuotations([]);
    }
  }, []);

  const doFetch = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    await fetchQuotations();
    if (showLoading) setLoading(false);
    hasLoadedOnceRef.current = true;
  }, [fetchQuotations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await doFetch(false);
    setRefreshing(false);
  }, [doFetch]);

  useEffect(() => {
    if (refreshKey !== lastFetchedRefreshKeyRef.current) {
      lastFetchedRefreshKeyRef.current = refreshKey;
      const isInitialLoad = !hasLoadedOnceRef.current;
      doFetch(isInitialLoad);
    }
  }, [doFetch, refreshKey]);

  const getStatusStyle = (s: string) => {
    const map: Record<string, { bg: string; text: string }> = {
      converted: { bg: colors.purple, text: colors.white },
      draft: { bg: colors.gray100, text: colors.gray700 },
      sent: { bg: colors.gray100, text: colors.gray700 },
      accepted: { bg: colors.green600, text: colors.white },
      rejected: { bg: colors.red500, text: colors.white },
    };
    return map[s] || map.sent;
  };

  const clientOptions = useMemo(() => {
    const clients = new Set<string>();
    sentQuotations.forEach((q) => clients.add(q.client));
    receivedQuotations.forEach((q) => clients.add(q.client));
    return Array.from(clients).sort();
  }, [sentQuotations, receivedQuotations]);

  const applyFiltersAndSort = useMemo(() => {
    const bySearch = (q: Quotation) => {
      if (!searchQuery.trim()) return true;
      const qq = searchQuery.toLowerCase();
      return q.client.toLowerCase().includes(qq) || q.quoNumber.toLowerCase().includes(qq);
    };
    const byFilterStatus = (status: string) => {
      if (filters.statuses.length === 0) return true;
      return filters.statuses.includes(status);
    };
    const byFilterClient = (client: string) => {
      if (filters.clients.length === 0) return true;
      return filters.clients.includes(client);
    };
    const sortFn = (a: Quotation, b: Quotation) => {
      const da = parseDate(a.dateRaw)?.getTime() ?? 0;
      const db = parseDate(b.dateRaw)?.getTime() ?? 0;
      if (sortKey === 'date-desc') return db - da;
      if (sortKey === 'date-asc') return da - db;
      if (sortKey === 'amount-desc') return b.amount - a.amount;
      if (sortKey === 'amount-asc') return a.amount - b.amount;
      if (sortKey === 'client') return a.client.localeCompare(b.client);
      return db - da;
    };
    const baseList = tab === 'sent' ? sentQuotations : receivedQuotations;
    const filtered = baseList
      .filter(
        (q) =>
          bySearch(q) &&
          byFilterStatus(q.status) &&
          byFilterClient(q.client) &&
          matchesAmountFilters(q.amount, filters) &&
          matchesDateQuick(q.dateRaw, filters.dateQuick)
      )
      .sort(sortFn);
    return filtered;
  }, [searchQuery, filters, sortKey, tab, sentQuotations, receivedQuotations]);

  const filtered = applyFiltersAndSort;

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

  const getResultCount = () => filtered.length;
  const getTotalCount = () => (tab === 'sent' ? sentQuotations.length : receivedQuotations.length);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quotations</Text>
        <TouchableOpacity onPress={onCreateQuote} style={styles.newBtn}>
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
            placeholder="Search quotations, clients..."
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
          Showing {getResultCount()} of {getTotalCount()} quotations
          {searchQuery ? ` for "${searchQuery}"` : ''}
        </Text>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['sent', 'received'] as const).map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tab}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {tab === t && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Quotation List */}
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
        {loading && !refreshing ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading quotations...</Text>
          </View>
        ) : !isFiltered && filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No Quotations Yet</Text>
            <Text style={styles.emptySub}>Tap New to create your first quotation</Text>
          </View>
        ) : isFiltered && filtered.length === 0 ? (
          <View style={styles.emptyFiltered}>
            <Image source={require('../../assets/empty.png')} style={styles.emptyImage} resizeMode="contain" />
            <Text style={styles.emptyFilteredTitle}>No quotations found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
            <View style={styles.emptyActions}>
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setSearchQuery('')}
                  style={styles.emptyBtn}
                >
                  Clear Search
                </Button>
              ) : null}
              {hasActiveFilters ? (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setFilters(emptyFilters)}
                  style={styles.emptyBtn}
                >
                  Clear Filters
                </Button>
              ) : null}
            </View>
          </View>
        ) : (
          filtered.map((q, i) => {
            const sc = getStatusStyle(q.status);
            return (
              <AnimatedSection key={q.id} index={i} delay={0}>
              <TouchableOpacity
                onPress={() => onSelectQuote(q)}
                style={styles.card}
                activeOpacity={0.7}
              >
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                      <Ionicons name="arrow-redo" size={18} color={colors.purple} />
                    </View>
                    <View style={styles.cardContent}>
                      <Text style={styles.clientName}>{q.client}</Text>
                      <Text style={styles.metaLine}>#{q.quoNumber} • {q.date}</Text>
                      <View style={styles.versionTag}>
                        <Text style={styles.versionText}>{q.version}</Text>
                      </View>
                      <View style={styles.validRow}>
                        <Ionicons name="calendar-outline" size={12} color={colors.gray500} />
                        <Text style={styles.validText}>Valid until: {q.validUntil}</Text>
                      </View>
                      <View style={styles.viewRow}>
                        <Ionicons
                          name="eye-outline"
                          size={12}
                          color={q.viewStatus === 'Not viewed yet' ? colors.gray400 : colors.blue600}
                        />
                        <Text
                          style={[
                            styles.viewText,
                            q.viewStatus !== 'Not viewed yet' && styles.viewTextActive,
                          ]}
                        >
                          {q.viewStatus}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.amount}>{formatINR(q.amount)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: sc.text }]}>
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
              </AnimatedSection>
            );
          })
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onFiltersChange={setFilters}
        statusOptions={STATUS_OPTIONS}
        clientOptions={clientOptions}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.navy },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.navy, paddingVertical: 0 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    paddingBottom: 0,
  },
  tab: { marginRight: 24, paddingBottom: 12 },
  tabText: { fontSize: 15, fontWeight: '500', color: colors.gray500 },
  tabTextActive: { color: colors.purple, fontWeight: '600' },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.purple,
    borderRadius: 1,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 16 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flexDirection: 'row', flex: 1, minWidth: 0 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1, minWidth: 0 },
  clientName: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  metaLine: { fontSize: 12, color: colors.gray500, marginBottom: 6 },
  versionTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  versionText: { fontSize: 11, fontWeight: '600', color: colors.gray700 },
  validRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  validText: { fontSize: 12, color: colors.gray500 },
  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewText: { fontSize: 12, color: colors.gray400 },
  viewTextActive: { color: colors.blue600 },

  cardRight: { alignItems: 'flex-end', marginLeft: 12 },
  amount: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },

  emptyState: { paddingVertical: 48, alignItems: 'center' },
  emptyText: { fontSize: 15, color: colors.gray500 },
  emptyWrap: { alignItems: 'center', paddingVertical: 48 },
  emptyImage: { width: 220, height: 220, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  emptySub: { fontSize: 15, color: colors.gray500 },
  emptyFiltered: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyFilteredTitle: {
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
