import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ReportsAnalyticsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSendReminders?: () => void;
  onNavigateToCustomers?: () => void;
}

const PERIOD_MAP: Record<string, string> = {
  'This Month': 'this_month',
  'Last 30 Days': 'last_30',
  'This Quarter': 'this_quarter',
  Custom: 'this_month',
};

interface AnalyticsData {
  totalInvoiced: number;
  totalChange: number;
  invoicesSent: number;
  received: number;
  receivedChange: number;
  invoicesPaid: number;
  pending: number;
  pendingCount: number;
  overdue: number;
  overdueCount: number;
  months: { month: string; amount: number }[];
  avgMonthly: number;
  avgPayDays: number;
  onTimePct: number;
  topClients: { name: string; amount: number; invoices: number }[];
}

const DEFAULT_DATA: AnalyticsData = {
  totalInvoiced: 0,
  totalChange: 0,
  invoicesSent: 0,
  received: 0,
  receivedChange: 0,
  invoicesPaid: 0,
  pending: 0,
  pendingCount: 0,
  overdue: 0,
  overdueCount: 0,
  months: [],
  avgMonthly: 0,
  avgPayDays: 0,
  onTimePct: 0,
  topClients: [],
};

const REPORTS = [
  { key: 'sales', label: 'Sales Summary', icon: '📊' },
  { key: 'outstanding', label: 'Outstanding Report', icon: '⚠️' },
  { key: 'tax', label: 'Tax Report', icon: '🧾' },
  { key: 'client', label: 'Client Statement', icon: '👤' },
];

export function ReportsAnalyticsPage({ isOpen, onClose, onOpenSendReminders, onNavigateToCustomers }: ReportsAnalyticsPageProps) {
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const period = PERIOD_MAP[timeFilter] ?? 'this_month';

  const fetchAnalytics = useCallback(async () => {
    try {
      setFetchError(null);
      const { data: res } = await api.get<AnalyticsData>(`/reports/analytics?period=${period}&_=${Date.now()}`);
      setData(res ?? DEFAULT_DATA);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        ?? (err as { message?: string })?.message
        ?? 'Could not load analytics';
      setFetchError(msg);
      setData(DEFAULT_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchAnalytics();
    }
  }, [isOpen, fetchAnalytics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalytics();
  }, [fetchAnalytics]);
  const outstanding = data.pending + data.overdue;
  const totalInvoices = data.invoicesPaid + data.pendingCount + data.overdueCount;
  const paidPct = totalInvoices > 0 ? Math.round((data.invoicesPaid / totalInvoices) * 100) : 0;
  const pendingPct = totalInvoices > 0 ? Math.round((data.pendingCount / totalInvoices) * 100) : 0;
  const overduePct = totalInvoices > 0 ? Math.round((data.overdueCount / totalInvoices) * 100) : 0;
  const chartMonths = data.months.length > 0 ? data.months : [{ month: '—', amount: 0 }];
  const maxRevenue = Math.max(...chartMonths.map((m) => m.amount), 1);

  const circumference = 88;
  const paidStroke = (paidPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;
  const overdueStroke = (overduePct / 100) * circumference;

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.navy} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reports & Analytics</Text>
            <TouchableOpacity onPress={() => setShowExportSheet(true)} style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={22} color={colors.gray500} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContent}
          >
            {['This Month', 'Last 30 Days', 'This Quarter', 'Custom'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, timeFilter === f && styles.filterChipActive]}
                onPress={() => {
                  if (f === 'Custom') setShowDatePicker(true);
                  else {
                    setTimeFilter(f);
                    setLoading(true);
                  }
                }}
              >
                {f === 'Custom' && <Ionicons name="calendar-outline" size={11} color={timeFilter === f ? colors.white : colors.gray600} style={{ marginRight: 3 }} />}
                <Text style={[styles.filterChipText, timeFilter === f && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.purple]} />
          }
        >
          {loading && !refreshing ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.purple} />
              <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
          ) : fetchError ? (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.red500} />
              <Text style={styles.errorText}>{fetchError}</Text>
              <Button variant="outline" onPress={() => { setLoading(true); fetchAnalytics(); }} style={styles.retryBtn}>
                Retry
              </Button>
            </View>
          ) : (
          <>
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>TOTAL INVOICED</Text>
              <View style={[styles.trendBadge, data.totalChange >= 0 ? styles.trendUp : styles.trendDown]}>
                <Ionicons name={data.totalChange >= 0 ? 'trending-up-outline' : 'trending-down-outline'} size={10} color={data.totalChange >= 0 ? colors.green600 : colors.red500} />
                <Text style={[styles.trendText, data.totalChange >= 0 ? styles.trendTextUp : styles.trendTextDown]}>
                  {data.totalChange >= 0 ? '+' : ''}{data.totalChange}%
                </Text>
              </View>
            </View>
            <Text style={styles.cardAmount}>{formatINR(data.totalInvoiced)}</Text>
            <Text style={styles.cardSub}>{data.invoicesSent} invoices sent</Text>
          </Card>

          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>MONEY RECEIVED</Text>
              <View style={[styles.trendBadge, data.receivedChange >= 0 ? styles.trendUp : styles.trendDown]}>
                <Ionicons name={data.receivedChange >= 0 ? 'trending-up-outline' : 'trending-down-outline'} size={10} color={data.receivedChange >= 0 ? colors.green600 : colors.red500} />
                <Text style={[styles.trendText, data.receivedChange >= 0 ? styles.trendTextUp : styles.trendTextDown]}>
                  {data.receivedChange >= 0 ? '+' : ''}{data.receivedChange}%
                </Text>
              </View>
            </View>
            <Text style={styles.cardAmount}>{formatINR(data.received)}</Text>
            <Text style={styles.cardSub}>{data.invoicesPaid} invoices paid</Text>
          </Card>

          <Card style={StyleSheet.flatten([styles.card, data.overdueCount > 0 && styles.cardOutstanding])}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>OUTSTANDING</Text>
              {data.overdueCount > 0 && <Ionicons name="alert-circle-outline" size={18} color={colors.red500} />}
            </View>
            <Text style={styles.cardAmount}>{formatINR(outstanding)}</Text>
            <View style={styles.outstandingBreakdown}>
              <View style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.amber500 }]} />
                <Text style={styles.breakdownText}>
                  Pending: {formatINR(data.pending)} ({data.pendingCount} invoices)
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <View style={[styles.breakdownDot, { backgroundColor: colors.red500 }]} />
                <Text style={[styles.breakdownText, styles.breakdownTextRed]}>
                  Overdue: {formatINR(data.overdue)} ({data.overdueCount} invoices)
                </Text>
              </View>
            </View>
            {data.overdueCount > 0 && (
              <Button onPress={onOpenSendReminders ?? (() => {})} style={styles.reminderBtn}>
                Send Reminders to All Overdue
              </Button>
            )}
          </Card>

          <Text style={styles.sectionTitle}>PAYMENT STATUS</Text>
          <Card style={styles.paymentCard}>
            <View style={styles.donutRow}>
              <View style={styles.donutWrap}>
                <Svg width={96} height={96} viewBox="0 0 36 36">
                  <Circle cx="18" cy="18" r="14" fill="none" stroke={colors.gray200} strokeWidth="5" />
                  <Circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={colors.green600}
                    strokeWidth="5"
                    strokeDasharray={`${paidStroke} ${circumference - paidStroke}`}
                    strokeDashoffset={0}
                    transform="rotate(-90 18 18)"
                  />
                  <Circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={colors.amber500}
                    strokeWidth="5"
                    strokeDasharray={`${pendingStroke} ${circumference - pendingStroke}`}
                    strokeDashoffset={-paidStroke}
                    transform="rotate(-90 18 18)"
                  />
                  <Circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={colors.red500}
                    strokeWidth="5"
                    strokeDasharray={`${overdueStroke} ${circumference - overdueStroke}`}
                    strokeDashoffset={-(paidStroke + pendingStroke)}
                    transform="rotate(-90 18 18)"
                  />
                </Svg>
                <View style={styles.donutCenter}>
                  <Text style={styles.donutCenterNum}>{totalInvoices}</Text>
                  <Text style={styles.donutCenterLabel}>Total</Text>
                </View>
              </View>
              <View style={styles.legend}>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: colors.green600 }]} />
                  <Text style={styles.legendLabel}>Paid</Text>
                  <Text style={styles.legendValue}>{data.invoicesPaid} ({formatINR(data.received)})</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: colors.amber500 }]} />
                  <Text style={styles.legendLabel}>Pending</Text>
                  <Text style={styles.legendValue}>{data.pendingCount} ({formatINR(data.pending)})</Text>
                </View>
                <View style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: colors.red500 }]} />
                  <Text style={styles.legendLabel}>Overdue</Text>
                  <Text style={styles.legendValue}>{data.overdueCount} ({formatINR(data.overdue)})</Text>
                </View>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>REVENUE TREND (LAST 6 MONTHS)</Text>
          <Card style={styles.chartCard}>
            <View style={styles.chartRow}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>{formatINR(maxRevenue)}</Text>
                <Text style={styles.yAxisLabel}>{formatINR(Math.round(maxRevenue * 0.5))}</Text>
                <Text style={styles.yAxisLabel}>₹0</Text>
              </View>
              <View style={styles.barsWrap}>
                {chartMonths.map((d, i) => {
                  const barHeight = maxRevenue > 0 ? (d.amount / maxRevenue) * 80 : 0;
                  return (
                    <View key={`${timeFilter}-${i}`} style={styles.barCol}>
                      <View style={[styles.bar, { height: barHeight }]} />
                      <Text style={styles.barLabel}>{d.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Average: <Text style={styles.chartFooterBold}>{formatINR(data.avgMonthly)}/month</Text>
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>TOP CLIENTS (BY REVENUE)</Text>
          <Card style={styles.clientsCard}>
            {data.topClients.length === 0 ? (
              <Text style={styles.emptyClients}>No client data for this period</Text>
            ) : (
            <>
            {data.topClients.map((c, i) => (
              <View key={i} style={[styles.clientRow, i < data.topClients.length - 1 && styles.clientRowBorder]}>
                <View style={styles.clientLeft}>
                  <Text style={styles.clientNum}>{i + 1}.</Text>
                  <View>
                    <Text style={styles.clientName} numberOfLines={1}>{c.name}</Text>
                    <Text style={styles.clientInvoices}>{c.invoices} invoice{c.invoices > 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <Text style={styles.clientAmount}>{formatINR(c.amount)}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => onNavigateToCustomers?.()}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All Clients</Text>
              <Ionicons name="chevron-forward" size={12} color={colors.purple} />
            </TouchableOpacity>
            </>
            )}
          </Card>

          <Text style={styles.sectionTitle}>QUICK INSIGHTS</Text>
          <Card style={styles.insightsCard}>
            <View style={styles.insightRow}>
              <Ionicons name="time-outline" size={18} color={colors.gray400} />
              <Text style={styles.insightText}>
                Customers pay in <Text style={styles.insightBold}>{data.avgPayDays} days</Text> on average
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="checkmark-circle-outline" size={18} color={colors.green600} />
              <Text style={styles.insightText}>
                <Text style={styles.insightBold}>{data.onTimePct}%</Text> of invoices are paid on time
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="calendar-outline" size={18} color={colors.blue600} />
              <Text style={styles.insightText}>
                Best payment: <Text style={styles.insightBold}>Within first 10 days</Text>
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>DOWNLOAD REPORTS</Text>
          <View style={styles.reportsGrid}>
            {REPORTS.map((r) => (
              <View key={r.key} style={styles.reportCard}>
                <TouchableOpacity
                  style={styles.reportCardContent}
                  onPress={() => setActiveReport(r.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reportIcon}>{r.icon}</Text>
                  <Text style={styles.reportLabel}>{r.label}</Text>
                </TouchableOpacity>
                <Button variant="outline" size="sm" onPress={() => setShowExportSheet(true)}>
                  Download
                </Button>
              </View>
            ))}
          </View>

          <View style={{ height: 40 }} />
          </>
          )}
        </ScrollView>
      </View>

      {showExportSheet && (
        <Modal visible transparent animationType="slide">
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowExportSheet(false)}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Export Complete Report</Text>
              <Text style={styles.sheetSub}>Export all analytics for {timeFilter}</Text>
              <TouchableOpacity style={styles.sheetOption}>
                <Ionicons name="document-text-outline" size={20} color={colors.red500} />
                <Text style={styles.sheetOptionText}>Download as PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetOption}>
                <Ionicons name="stats-chart-outline" size={20} color={colors.green600} />
                <Text style={styles.sheetOptionText}>Download as Excel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetOption}>
                <Ionicons name="mail-outline" size={20} color={colors.blue600} />
                <Text style={styles.sheetOptionText}>Email Report</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowExportSheet(false)}>
                <Text style={styles.sheetCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {showDatePicker && (
        <Modal visible transparent animationType="slide">
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
            <View style={styles.sheet} onStartShouldSetResponder={() => true}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Custom Date Range</Text>
              <Text style={styles.sheetSub}>Select start and end dates</Text>
              <TouchableOpacity onPress={() => { setTimeFilter('Custom'); setShowDatePicker(false); }}>
                <Text style={styles.sheetApply}>Apply Custom</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.sheetCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {activeReport && (
        <Modal visible animationType="slide">
          <View style={styles.reportModal}>
            <View style={styles.reportHeader}>
              <TouchableOpacity onPress={() => setActiveReport(null)}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.reportHeaderTitle}>
                {REPORTS.find((r) => r.key === activeReport)?.label || 'Report'}
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.reportScroll}>
              <View style={styles.reportBody}>
                <Text style={styles.reportPeriod}>{timeFilter}</Text>
                {activeReport === 'sales' && (
                  <View style={styles.reportHighlight}>
                    <Text style={styles.reportHighlightLabel}>Total Revenue</Text>
                    <Text style={styles.reportHighlightValue}>{formatINR(data.totalInvoiced)}</Text>
                    <Text style={styles.reportHighlightSub}>+{data.totalChange}% from last period</Text>
                  </View>
                )}
                {activeReport === 'outstanding' && (
                  <View style={styles.reportHighlightRed}>
                    <Text style={styles.reportHighlightLabel}>Total Outstanding</Text>
                    <Text style={styles.reportHighlightValueRed}>{formatINR(outstanding)}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <View style={styles.reportFooter}>
              <Button variant="outline" style={styles.reportFooterBtn} onPress={() => {}}>
                <Ionicons name="download-outline" size={16} color={colors.purple} style={{ marginRight: 6 }} />
                PDF
              </Button>
              <Button style={styles.reportFooterBtn} onPress={() => {}}>
                <Ionicons name="share-social" size={16} color={colors.white} style={{ marginRight: 6 }} />
                Share
              </Button>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  headerSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  downloadBtn: { padding: 8 },
  filterScroll: { flexGrow: 0, flexShrink: 0, maxHeight: 36 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  filterChip: {
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 0,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gray100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: colors.purple },
  filterChipText: { fontSize: 12, fontWeight: '600', color: colors.gray600 },
  filterChipTextActive: { fontSize: 12, fontWeight: '600', color: colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  card: { marginBottom: 12, padding: 16 },
  cardOutstanding: { backgroundColor: 'rgba(239, 68, 68, 0.06)', borderColor: colors.red500 + '40' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardLabel: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  trendUp: { backgroundColor: colors.green50 },
  trendDown: { backgroundColor: colors.red50 },
  trendText: { fontSize: 10, fontWeight: '700', marginLeft: 4 },
  trendTextUp: { color: colors.green600 },
  trendTextDown: { color: colors.red500 },
  cardAmount: { fontSize: 28, fontWeight: '700', color: colors.navy },
  cardSub: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  outstandingBreakdown: { marginTop: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  breakdownText: { fontSize: 12, color: colors.gray600 },
  breakdownTextRed: { color: colors.red500, fontWeight: '600' },
  reminderBtn: { marginTop: 16, height: 36 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  paymentCard: { padding: 20, marginBottom: 12 },
  donutRow: { flexDirection: 'row', alignItems: 'center' },
  donutWrap: { width: 96, height: 96, position: 'relative', marginRight: 20 },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterNum: { fontSize: 18, fontWeight: '700', color: colors.navy },
  donutCenterLabel: { fontSize: 9, color: colors.gray400, marginTop: 2 },
  legend: { flex: 1 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { fontSize: 12, color: colors.gray600, marginRight: 8 },
  legendValue: { fontSize: 12, fontWeight: '700', color: colors.navy },
  chartCard: { padding: 16, marginBottom: 12 },
  chartRow: { flexDirection: 'row', height: 140 },
  yAxis: { width: 60, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8 },
  yAxisLabel: { fontSize: 9, color: colors.gray400 },
  barsWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, paddingBottom: 20 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: {
    width: 24,
    minHeight: 4,
    maxHeight: 80,
    backgroundColor: colors.purple,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 6,
  },
  barLabel: { fontSize: 9, color: colors.gray400 },
  chartFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    alignItems: 'center',
  },
  chartFooterText: { fontSize: 12, color: colors.gray500 },
  chartFooterBold: { fontWeight: '700', color: colors.navy },
  clientsCard: { marginBottom: 12, overflow: 'hidden' },
  clientRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  clientRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray50 },
  clientLeft: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  clientNum: { fontSize: 12, fontWeight: '700', color: colors.gray400, width: 20 },
  clientName: { fontSize: 14, fontWeight: '600', color: colors.navy },
  clientInvoices: { fontSize: 11, color: colors.gray400, marginTop: 2 },
  clientAmount: { fontSize: 14, fontWeight: '700', color: colors.navy },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: 4,
  },
  viewAllText: { fontSize: 12, fontWeight: '700', color: colors.purple },
  insightsCard: { padding: 16, marginBottom: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  insightText: { flex: 1, fontSize: 14, color: colors.gray600, marginLeft: 12 },
  insightBold: { fontWeight: '700', color: colors.navy },
  reportsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  reportCard: {
    width: '50%',
    padding: 12,
    paddingHorizontal: 16,
  },
  reportCardContent: { flex: 1 },
  reportIcon: { fontSize: 24, marginBottom: 8 },
  reportLabel: { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 12 },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  sheetSub: { fontSize: 14, color: colors.gray500, marginBottom: 20 },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    marginBottom: 8,
  },
  sheetOptionText: { fontSize: 14, fontWeight: '500', color: colors.gray700, marginLeft: 12 },
  sheetCancel: { fontSize: 14, fontWeight: '600', color: colors.gray500, textAlign: 'center', marginTop: 16 },
  sheetApply: { fontSize: 14, fontWeight: '700', color: colors.purple, textAlign: 'center', marginBottom: 8 },
  reportModal: { flex: 1, backgroundColor: colors.white },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  reportHeaderTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy, textAlign: 'center' },
  reportScroll: { flex: 1, backgroundColor: colors.gray50 },
  reportBody: { padding: 20 },
  reportPeriod: { fontSize: 12, color: colors.gray400, marginBottom: 16 },
  reportHighlight: { backgroundColor: colors.purple50, padding: 20, borderRadius: 12, alignItems: 'center' },
  reportHighlightRed: { backgroundColor: colors.red50, padding: 20, borderRadius: 12, alignItems: 'center' },
  reportHighlightLabel: { fontSize: 11, color: colors.gray500, marginBottom: 4 },
  reportHighlightValue: { fontSize: 24, fontWeight: '700', color: colors.navy },
  reportHighlightValueRed: { fontSize: 24, fontWeight: '700', color: colors.red500 },
  reportHighlightSub: { fontSize: 11, color: colors.green600, fontWeight: '600', marginTop: 4 },
  loadingWrap: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, color: colors.gray500, marginTop: 12 },
  errorWrap: { padding: 32, alignItems: 'center' },
  errorText: { fontSize: 14, color: colors.red500, textAlign: 'center', marginTop: 12 },
  retryBtn: { marginTop: 16 },
  emptyClients: { padding: 24, textAlign: 'center', fontSize: 14, color: colors.gray500 },
  reportFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  reportFooterBtn: { flex: 1 },
});
