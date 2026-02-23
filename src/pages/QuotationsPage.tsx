import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { AnimatedSection } from '../components/AnimatedSection';

interface Quotation {
  id: string;
  quoNumber: string;
  client: string;
  amount: number;
  date: string;
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
  valid_until?: string;
  view_status?: string;
  version?: string;
  status: string;
  type: string;
  customers?: { name?: string } | null;
}): Quotation {
  const client = raw.client_name ?? (raw.customers as { name?: string })?.name ?? 'Unknown';
  return {
    id: raw.id,
    quoNumber: raw.quo_number,
    client,
    amount: Number(raw.amount) || 0,
    date: formatDateShort(raw.date),
    validUntil: formatDateShort(raw.valid_until),
    version: raw.version || 'v1',
    viewStatus: raw.view_status || 'Not viewed yet',
    status: (raw.status as Quotation['status']) || 'draft',
    type: (raw.type as Quotation['type']) || 'sent',
  };
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
  const [loading, setLoading] = useState(true);

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<unknown[]>('/quotations');
      const list = Array.isArray(data) ? data.map((r: any) => toQuotation(r)) : [];
      const sent = list.filter((q) => q.type === 'sent');
      const received = list.filter((q) => q.type === 'received');
      setSentQuotations(sent);
      setReceivedQuotations(received);
    } catch {
      setSentQuotations([]);
      setReceivedQuotations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations, refreshKey]);

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

  const list = tab === 'sent' ? sentQuotations : receivedQuotations;
  const filtered = searchQuery.trim()
    ? list.filter(
        (q) =>
          q.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.quoNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : list;

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
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="filter" size={18} color={colors.gray600} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="swap-vertical" size={18} color={colors.gray600} />
        </TouchableOpacity>
      </View>

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
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading quotations...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No quotations found</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
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
});
