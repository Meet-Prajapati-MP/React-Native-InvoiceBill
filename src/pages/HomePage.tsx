import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';

interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: 'sent' | 'received';
  status: 'completed' | 'pending';
  invoiceRef?: string;
  note?: string;
  milestone?: { current: number; total: number };
}

const transactions: Transaction[] = [
  { id: '1', name: 'Priya Sharma', date: 'Today, 10:23 AM', amount: 15000, type: 'received', status: 'completed', invoiceRef: 'INV-101', note: 'Website Design', milestone: { current: 2, total: 3 } },
  { id: '2', name: 'Design Hub', date: 'Today, 9:15 AM', amount: 45000, type: 'received', status: 'completed', invoiceRef: 'INV-104', note: 'Full Payment' },
  { id: '3', name: 'Rahul Verma', date: 'Yesterday, 4:45 PM', amount: 2500, type: 'sent', status: 'completed', invoiceRef: 'INV-105', note: 'Logo Design' },
  { id: '4', name: 'Design Studio', date: 'Yesterday, 2:30 PM', amount: 32500, type: 'received', status: 'completed', invoiceRef: 'INV-103', note: 'Milestone Payment', milestone: { current: 1, total: 2 } },
  { id: '5', name: 'Neha Patel', date: '15 Feb, 9:15 AM', amount: 1200, type: 'sent', status: 'completed', note: 'Reimbursement' },
  { id: '6', name: 'Tech Solutions', date: '14 Feb, 11:00 AM', amount: 18500, type: 'received', status: 'completed', invoiceRef: 'INV-102', note: 'Consulting' },
  { id: '7', name: 'Global Services', date: '13 Feb, 3:20 PM', amount: 56000, type: 'received', status: 'completed', invoiceRef: 'INV-106', note: 'Project Deliverable' },
];

interface HomePageProps {
  onNavigate: (action: string) => void;
  onOpenNotifications: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onOpenScanQR?: () => void;
}

export function HomePage({ onNavigate, onOpenNotifications, onSelectTransaction, onOpenScanQR }: HomePageProps) {
  const [showQROverlay, setShowQROverlay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrGrid = Array.from({ length: 100 }).map((_, i) => {
    const isCorner = (i < 30 && i % 10 < 3) || (i < 30 && i % 10 > 6) || (i > 69 && i % 10 < 3);
    return isCorner || Math.random() > 0.5;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.userName}>Ankit Sharma</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onOpenNotifications} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={colors.navy} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onOpenScanQR ? onOpenScanQR() : setShowQROverlay(true)}
            style={[styles.iconBtn, styles.qrBtn]}
          >
            <Ionicons name="qr-code-outline" size={20} color={colors.purple} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showQROverlay} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setShowQROverlay(false)} style={styles.closeBtn}>
              <Ionicons name="close-outline" size={24} color={colors.gray600} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Your Payment QR</Text>
            <View style={styles.qrBox}>
              <View style={styles.qrGrid}>
                {qrGrid.map((filled, i) => (
                  <View key={i} style={[styles.qrCell, filled && styles.qrCellFilled]} />
                ))}
              </View>
            </View>
            <Text style={styles.upiLabel}>UPI ID</Text>
            <View style={styles.upiBox}>
              <Text style={styles.upiId}>arjun@trustopay</Text>
            </View>
            <Button onPress={handleCopy} variant={copied ? 'outline' : 'primary'} style={styles.copyBtn}>
              <View style={styles.copyBtnContent}>
                {copied ? <Ionicons name="checkmark" size={18} color={colors.gray700} /> : <Ionicons name="copy" size={18} color={colors.white} />}
                <Text style={[styles.copyText, copied && styles.copyTextDark]}>{copied ? 'Copied!' : 'Copy UPI ID'}</Text>
              </View>
            </Button>
          </View>
        </View>
      </Modal>

      <AnimatedSlideIn delay={80}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatINR(12650) : '₹ •••••'}
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible((v) => !v)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={balanceVisible ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.gray500}
              />
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedSlideIn>

      <AnimatedSlideIn delay={160}>
      <View style={styles.quickActions}>
        {[
          { icon: 'scan' as const, label: 'Scan QR', action: () => (onOpenScanQR ? onOpenScanQR() : onNavigate('scan-qr')) },
          { icon: 'send' as const, label: 'Transfer', action: () => onNavigate('send-payment') },
          { icon: 'wallet' as const, label: 'Add Money', action: () => onNavigate('add-money') },
          { icon: 'arrow-up' as const, label: 'Withdraw', action: () => onNavigate('withdraw') },
        ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.action}
              style={styles.actionBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={item.icon} size={22} color={colors.purple} />
              </View>
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
        ))}
      </View>
      </AnimatedSlideIn>

      <AnimatedSlideIn delay={240}>
      <View style={styles.promoBanner}>
        <Text style={styles.promoTitle}>Crafted with ❤️ in Gujarat</Text>
        <Text style={styles.promoDesc}>Built to Empower MSMEs & SoloPreneurs Like You</Text>
        <View style={styles.tricolor}>
          <View style={[styles.tricolorBar, { backgroundColor: colors.saffron }]} />
          <View style={[styles.tricolorBar, { backgroundColor: colors.white }]} />
          <View style={[styles.tricolorBar, { backgroundColor: colors.indianGreen }]} />
        </View>
      </View>
      </AnimatedSlideIn>

      <AnimatedSlideIn delay={320}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>
        {transactions.map((tx) => (
          <TouchableOpacity
            key={tx.id}
            onPress={() => onSelectTransaction(tx)}
            style={styles.txCard}
            activeOpacity={0.7}
          >
            <View style={styles.txRow}>
              <View style={[styles.txAvatar, tx.type === 'received' ? styles.txAvatarGreen : styles.txAvatarPurple]}>
                <Text style={[styles.txAvatarText, tx.type === 'received' ? styles.txAvatarTextGreen : styles.txAvatarTextPurple]}>
                  {tx.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.txContent}>
                <View style={styles.txTop}>
                  <Text style={styles.txName} numberOfLines={1}>
                    {tx.invoiceRef && `${tx.invoiceRef} • `}{tx.name}
                  </Text>
                  <Text style={[styles.txAmount, tx.type === 'received' ? styles.txAmountGreen : styles.txAmountRed]}>
                    {tx.type === 'received' ? '+' : '-'}{formatINR(tx.amount)}
                  </Text>
                </View>
                <Text style={styles.txMeta} numberOfLines={1}>
                  {tx.milestone ? `Milestone ${tx.milestone.current}/${tx.milestone.total} Paid` : tx.note || 'Payment'}
                  {tx.status === 'completed' && ` • ${tx.date}`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      </AnimatedSlideIn>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  userName: { fontSize: 18, fontWeight: '700', color: colors.navy },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBtn: { backgroundColor: colors.purple100 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red500,
  },
  modalOverlay: { flex: 1, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: 400, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 24, right: 24, padding: 8 },
  modalTitle: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 32 },
  qrBox: {
    width: 256,
    height: 256,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.purple,
    borderRadius: 24,
    padding: 16,
    marginBottom: 32,
  },
  qrGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  qrCell: { width: '10%', aspectRatio: 1 },
  qrCellFilled: { backgroundColor: colors.navy },
  upiLabel: { fontSize: 12, color: colors.gray500, marginBottom: 8 },
  upiBox: { backgroundColor: colors.gray50, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginBottom: 32 },
  upiId: { fontSize: 18, fontWeight: '700', color: colors.navy },
  copyBtn: { width: '100%' },
  copyBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  copyText: { color: colors.white },
  copyTextDark: { color: colors.gray700 },
  balanceSection: { alignItems: 'center', paddingTop: 8 },
  balanceLabel: { fontSize: 12, fontWeight: '500', color: colors.gray400, marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: colors.navy },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  actionBtn: { alignItems: 'center' },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: { fontSize: 11, fontWeight: '600', color: colors.gray500 },
  promoBanner: {
    marginHorizontal: 24,
    height: 128,
    borderRadius: 16,
    backgroundColor: colors.purple,
    padding: 20,
    justifyContent: 'center',
    marginBottom: 24,
  },
  promoTitle: { fontSize: 20, fontWeight: '700', color: colors.white, marginBottom: 4 },
  promoDesc: { fontSize: 12, color: colors.purple100 },
  tricolor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, flexDirection: 'row' },
  tricolorBar: { flex: 1 },
  section: { paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  viewAll: { fontSize: 14, fontWeight: '500', color: colors.gray400 },
  txCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
    marginBottom: 12,
  },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txAvatarGreen: { backgroundColor: colors.green50 },
  txAvatarPurple: { backgroundColor: colors.purple50 },
  txAvatarText: { fontSize: 16, fontWeight: '700' },
  txAvatarTextGreen: { color: colors.green600 },
  txAvatarTextPurple: { color: colors.purple },
  txContent: { flex: 1, minWidth: 0 },
  txTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  txName: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  txAmount: { fontSize: 14, fontWeight: '700' },
  txAmountGreen: { color: colors.green600 },
  txAmountRed: { color: colors.red500 },
  txMeta: { fontSize: 11, color: colors.gray400 },
});
