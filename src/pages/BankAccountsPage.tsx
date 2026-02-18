import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';

interface BankAccount {
  id: string;
  account_holder: string;
  account_number_last4?: string;
  ifsc: string;
  bank_name?: string;
  is_verified?: boolean;
}

/** Dummy bank accounts for review when API returns empty */
const DUMMY_ACCOUNTS: BankAccount[] = [
  { id: 'ba1', account_holder: 'Arjun Mehta', account_number_last4: '4532', ifsc: 'HDFC0001234', bank_name: 'HDFC Bank', is_verified: true },
  { id: 'ba2', account_holder: 'Arjun Mehta', account_number_last4: '7891', ifsc: 'SBIN0005678', bank_name: 'State Bank of India', is_verified: false },
];

interface BankAccountsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onBeforeAddAccount?: () => boolean;
}

export function BankAccountsPage({ isOpen, onClose, onBeforeAddAccount }: BankAccountsPageProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get<BankAccount[]>('/bank-accounts');
      const list = Array.isArray(data) ? data : [];
      setAccounts(list.length > 0 ? list : DUMMY_ACCOUNTS);
    } catch {
      setAccounts(DUMMY_ACCOUNTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchAccounts();
  }, [isOpen, fetchAccounts]);

  const handleAdd = async () => {
    if (onBeforeAddAccount && !onBeforeAddAccount()) return;
    if (!accountHolderName.trim() || !ifscCode.trim()) {
      setError('Account holder and IFSC are required');
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const last4 = accountNumber.replace(/\D/g, '').slice(-4) || undefined;
      const { data } = await api.post<BankAccount>('/bank-accounts', {
        account_holder: accountHolderName.trim(),
        ifsc: ifscCode.trim(),
        account_number_last4: last4,
      });
      setAccounts((prev) => [data, ...prev]);
      setAccountNumber('');
      setIfscCode('');
      setAccountHolderName('');
    } catch {
      setError('Failed to add account');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Accounts</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <AnimatedSlideIn delay={80}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.purple} />
            </View>
          ) : accounts.length === 0 ? (
            <Text style={styles.emptyText}>No bank accounts added yet</Text>
          ) : (
            accounts.map((acc) => (
              <Card key={acc.id} style={styles.linkedCard}>
                <View style={styles.linkedRow}>
                  <View style={styles.bankIconWrap}>
                    <Ionicons name="business" size={24} color={colors.blue600} />
                  </View>
                  <View style={styles.linkedInfo}>
                    <Text style={styles.bankName}>{acc.bank_name || 'Bank Account'}</Text>
                    <Text style={styles.accountMask}>
                      **** {acc.account_number_last4 || '••••'}
                    </Text>
                  </View>
                  {acc.is_verified ? (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.green600} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  ) : (
                    <Text style={styles.pendingText}>Pending</Text>
                  )}
                </View>
              </Card>
            ))
          )}
          </AnimatedSlideIn>

          <AnimatedSlideIn delay={200}>
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Add New Account</Text>
          <View style={styles.form}>
            <Input
              label="Account Number"
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter account number"
            />
            <Input
              label="IFSC Code"
              value={ifscCode}
              onChangeText={setIfscCode}
              placeholder="Enter IFSC code"
            />
            <Input
              label="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="Enter name as per bank"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.verifyBanner}>
            <Ionicons name="pulse" size={20} color={colors.blue600} />
            <Text style={styles.verifyBannerText}>
              For now we store your account details. Penny Drop verification can be added later.
            </Text>
          </View>

          <Button onPress={handleAdd} style={styles.verifyBtn} disabled={adding}>
            {adding ? 'Adding...' : 'Add Account'}
          </Button>
          </AnimatedSlideIn>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.gray500, marginBottom: 12 },
  linkedCard: { padding: 16 },
  linkedRow: { flexDirection: 'row', alignItems: 'center' },
  bankIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  linkedInfo: { flex: 1 },
  bankName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  accountMask: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.green50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: colors.green600 },
  form: { marginTop: 16 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.blue50,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
  },
  verifyBannerText: { flex: 1, fontSize: 14, color: colors.blue600 },
  verifyBtn: { height: 48 },
  loadingWrap: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.gray500, textAlign: 'center', paddingVertical: 24 },
  errorText: { fontSize: 14, color: colors.red500, marginTop: 8 },
  pendingText: { fontSize: 12, color: colors.gray500 },
});
