import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { AlertDialog } from './ui/AlertDialog';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

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

interface TransactionDetailProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetail({ isOpen, onClose, transaction }: TransactionDetailProps) {
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  if (!transaction) return null;

  const handleCopy = () => {
    setAlertDialog({ title: 'Copied!', message: 'UPI Ref. No. copied to clipboard' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transaction: ${formatINR(transaction.amount)} to ${transaction.name}\nDate: ${transaction.date}\nRef: 430129384756`,
        title: 'Transaction Receipt',
      });
    } catch {
      // User cancelled or error
    }
  };

  const handleReportIssue = () => {
    setAlertDialog({ title: 'Report Issue', message: 'Redirecting to support...' });
  };

  return (
    <>
    <Modal
      visible={isOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Status & Amount */}
          <View style={styles.statusSection}>
            <View style={styles.statusIcon}>
              <Ionicons name="checkmark-circle" size={32} color={colors.green600} />
            </View>
            <Text style={styles.amount}>
              {transaction.type === 'received' ? '+' : '-'}
              {formatINR(transaction.amount)}
            </Text>
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.green600} />
              <Text style={styles.statusText}>Payment Successful</Text>
            </View>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>

          {/* Details Card */}
          <Card style={styles.detailsCard}>
            <View style={styles.paidToSection}>
              <Text style={styles.sectionLabel}>PAID TO</Text>
              <View style={styles.paidToRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{transaction.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.recipientName}>{transaction.name}</Text>
                  <Text style={styles.recipientPhone}>+91 98765 43210</Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsSection}>
              {transaction.invoiceRef && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Invoice Reference</Text>
                  <View style={styles.detailValue}>
                    <View style={styles.detailValueRow}>
                      <Ionicons name="document-text" size={14} color={colors.purple} />
                      <Text style={styles.detailValueText}>#{transaction.invoiceRef}</Text>
                    </View>
                    {transaction.note && (
                      <Text style={styles.detailSubtext}>{transaction.note}</Text>
                    )}
                  </View>
                </View>
              )}

              {transaction.milestone && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Milestone</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.detailValueText}>
                      Milestone {transaction.milestone.current} of {transaction.milestone.total}
                    </Text>
                    <View style={styles.milestoneDots}>
                      {Array.from({ length: transaction.milestone.total }).map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.milestoneDot,
                            i < transaction.milestone!.current && styles.milestoneDotActive,
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method</Text>
                <View style={styles.detailValue}>
                  <Text style={styles.detailValueText}>Trustopay Wallet</Text>
                  <Text style={styles.detailSubtext}>Transaction ID: TXN-2024-8392</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UPI Ref. No</Text>
                <TouchableOpacity onPress={handleCopy} style={styles.copyRow}>
                  <Text style={styles.detailValueText}>430129384756</Text>
                  <Ionicons name="copy-outline" size={14} color={colors.gray400} />
                </TouchableOpacity>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Note</Text>
                <Text style={styles.detailValueText}>
                  {transaction.note || 'Invoice payment'}
                </Text>
              </View>
            </View>
          </Card>

          <Button variant="outline" onPress={handleShare} style={styles.shareBtn}>
            <View style={styles.shareBtnContent}>
              <Ionicons name="share-social" size={18} color={colors.purple} />
              <Text style={styles.shareBtnText}>Share Receipt</Text>
            </View>
          </Button>

          <TouchableOpacity onPress={handleReportIssue} style={styles.reportBtn}>
            <Ionicons name="warning" size={16} color={colors.purple} />
            <Text style={styles.reportText}>Report an issue</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>

    <AlertDialog
      visible={!!alertDialog}
      title={alertDialog?.title ?? ''}
      message={alertDialog?.message ?? ''}
      onOK={() => setAlertDialog(null)}
    />
    </>
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
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  statusSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.green600,
  },
  date: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
  },
  detailsCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 24,
  },
  paidToSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray500,
    letterSpacing: 1,
    marginBottom: 16,
  },
  paidToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  recipientPhone: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  detailsSection: {
    padding: 16,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray500,
    flex: 1,
  },
  detailValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
  },
  detailValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.navy,
    textAlign: 'right',
  },
  detailSubtext: {
    fontSize: 12,
    color: colors.gray400,
    marginTop: 2,
    textAlign: 'right',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneDots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray200,
  },
  milestoneDotActive: {
    backgroundColor: colors.purple,
  },
  shareBtn: {
    width: '100%',
    marginBottom: 24,
  },
  shareBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.purple,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reportText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.purple,
  },
});
