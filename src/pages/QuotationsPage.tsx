import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
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

const sentQuotations: Quotation[] = [
  { id: '1', quoNumber: 'QUO-012', client: 'Design Hub', amount: 85000, date: '12 Feb, 2026', version: 'v2', validUntil: '12 Mar, 2026', viewStatus: 'Viewed 3 times • 14 Feb, 2:30 PM', status: 'sent', type: 'sent' },
  { id: '2', quoNumber: 'QUO-011', client: 'Tech Solutions Ltd', amount: 120000, date: '10 Feb, 2026', version: 'v1', validUntil: '10 Mar, 2026', viewStatus: 'Not viewed yet', status: 'draft', type: 'sent' },
  { id: '3', quoNumber: 'QUO-010', client: 'Creative Studio', amount: 55000, date: '8 Feb, 2026', version: 'v1', validUntil: '8 Mar, 2026', viewStatus: 'Viewed by client • 9 Feb, 11:00 AM', status: 'accepted', type: 'sent' },
  { id: '4', quoNumber: 'QUO-009', client: 'Global Services', amount: 42000, date: '5 Feb, 2026', version: 'v2', validUntil: '5 Mar, 2026', viewStatus: 'Viewed 2 times • 6 Feb, 4:15 PM', status: 'converted', type: 'sent' },
  { id: '5', quoNumber: 'QUO-008', client: 'Alpha Corp', amount: 95000, date: '3 Feb, 2026', version: 'v1', validUntil: '3 Mar, 2026', viewStatus: 'Not viewed yet', status: 'rejected', type: 'sent' },
  { id: '6', quoNumber: 'QUO-007', client: 'Beta Systems', amount: 68000, date: '1 Feb, 2026', version: 'v1', validUntil: '1 Mar, 2026', viewStatus: 'Viewed by client • 2 Feb, 9:30 AM', status: 'sent', type: 'sent' },
  { id: '7', quoNumber: 'QUO-006', client: 'Marketing Agency', amount: 35000, date: '28 Jan, 2026', version: 'v3', validUntil: '28 Feb, 2026', viewStatus: 'Viewed 1 time • 29 Jan, 3:00 PM', status: 'accepted', type: 'sent' },
];

const receivedQuotations: Quotation[] = [
  { id: '8', quoNumber: 'QUO-R005', client: 'Design Studio', amount: 78000, date: '11 Feb, 2026', version: 'v1', validUntil: '11 Mar, 2026', viewStatus: 'Viewed 2 times • 12 Feb, 10:00 AM', status: 'sent', type: 'received' },
  { id: '9', quoNumber: 'QUO-R004', client: 'Hosting Provider', amount: 24000, date: '9 Feb, 2026', version: 'v1', validUntil: '9 Mar, 2026', viewStatus: 'Not viewed yet', status: 'draft', type: 'received' },
  { id: '10', quoNumber: 'QUO-R003', client: 'Software Tools Inc', amount: 156000, date: '6 Feb, 2026', version: 'v2', validUntil: '6 Mar, 2026', viewStatus: 'Viewed by client • 7 Feb, 2:45 PM', status: 'accepted', type: 'received' },
  { id: '11', quoNumber: 'QUO-R002', client: 'Creative Agency', amount: 52000, date: '4 Feb, 2026', version: 'v1', validUntil: '4 Mar, 2026', viewStatus: 'Viewed 1 time • 5 Feb, 11:20 AM', status: 'sent', type: 'received' },
  { id: '12', quoNumber: 'QUO-R001', client: 'Consulting Partners', amount: 98000, date: '2 Feb, 2026', version: 'v1', validUntil: '2 Mar, 2026', viewStatus: 'Not viewed yet', status: 'rejected', type: 'received' },
];

interface QuotationsPageProps {
  onCreateQuote: () => void;
  onSelectQuote: (q: Quotation) => void;
}

export function QuotationsPage({ onCreateQuote, onSelectQuote }: QuotationsPageProps) {
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [searchQuery, setSearchQuery] = useState('');

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
        {filtered.length === 0 ? (
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
