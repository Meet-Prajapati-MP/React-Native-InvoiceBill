import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

interface SubscriptionDetailsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const DETAILS = [
  { label: 'Plan', value: 'Yearly' },
  { label: 'Amount', value: '₹999/year' },
  { label: 'Started', value: 'Oct 24, 2024' },
  { label: 'Renews', value: 'Oct 24, 2025' },
  { label: 'Status', value: 'Active', isStatus: true },
];

const FEATURES = [
  'Unlimited invoices',
  'GST support',
  'Premium templates',
  'Priority support',
  'WhatsApp & Email delivery',
];

export function SubscriptionDetailsPage({ isOpen, onClose }: SubscriptionDetailsPageProps) {
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowCancelPrompt(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.summarySection}>
            <View style={styles.crownWrap}>
              <Ionicons name="star" size={40} color={colors.purple} />
            </View>
            <Text style={styles.planName}>Invoice Pro</Text>
            <Text style={styles.planSub}>Yearly Plan</Text>
          </View>

          <Card style={styles.detailsCard}>
            {DETAILS.map((row, i) => (
              <View
                key={row.label}
                style={[styles.detailRow, i < DETAILS.length - 1 && styles.detailRowBorder]}
              >
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text
                  style={[styles.detailValue, row.isStatus && styles.detailStatus]}
                >
                  {row.value}
                </Text>
              </View>
            ))}
          </Card>

          <Card style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>What's Included</Text>
            {FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <View style={styles.checkWrap}>
                  <Ionicons name="checkmark" size={16} color={colors.green600} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </Card>

          <Button
            variant="outline"
            onPress={() => {}}
            style={styles.invoiceBtn}
          >
            <Ionicons name="download-outline" size={18} color={colors.gray600} />
            <Text style={styles.invoiceBtnText}> Invoice</Text>
          </Button>

          {!showCancelPrompt ? (
            <TouchableOpacity style={styles.cancelLink} onPress={() => setShowCancelPrompt(true)}>
              <Text style={styles.cancelText}>Cancel Subscription</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.cancelCard}>
              <Text style={styles.cancelTitle}>Cancel subscription?</Text>
              <Text style={styles.cancelDesc}>
                You'll lose access to Pro features at the end of your billing period (Oct 24, 2025).
              </Text>
              <View style={styles.cancelActions}>
                <TouchableOpacity style={styles.keepBtn} onPress={() => setShowCancelPrompt(false)}>
                  <Text style={styles.keepBtnText}>Keep Plan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => {}}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  summarySection: { alignItems: 'center', marginBottom: 24 },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  planName: { fontSize: 22, fontWeight: '700', color: colors.navy },
  planSub: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  detailsCard: { marginBottom: 16, padding: 20 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  detailLabel: { fontSize: 14, color: colors.gray600 },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.navy },
  detailStatus: { color: colors.green600 },
  featuresCard: { marginBottom: 24, padding: 20 },
  featuresTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: { fontSize: 14, color: colors.gray700 },
  invoiceBtn: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceBtnText: { fontSize: 16, color: colors.gray600 },
  cancelLink: { alignItems: 'center', marginTop: 24 },
  cancelText: { fontSize: 14, fontWeight: '500', color: colors.red500 },
  cancelCard: {
    marginTop: 24,
    padding: 20,
    backgroundColor: colors.red50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red500,
  },
  cancelTitle: { fontSize: 16, fontWeight: '700', color: colors.red500, marginBottom: 8 },
  cancelDesc: { fontSize: 14, color: colors.gray600, marginBottom: 16 },
  cancelActions: { flexDirection: 'row', gap: 12 },
  keepBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: { fontSize: 16, fontWeight: '600', color: colors.gray600 },
  cancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.red500,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
