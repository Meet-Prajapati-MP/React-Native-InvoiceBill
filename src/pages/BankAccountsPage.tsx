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

/** Indian bank account: 9–18 digits */
function isValidAccountNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 18;
}

/** Indian IFSC: 11 chars – 4 letters, 0, 6 alphanumeric */
function isValidIFSC(value: string): boolean {
  const upper = value.trim().toUpperCase();
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(upper);
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
    setError(null);

    const holder = accountHolderName.trim();
    const acctNum = accountNumber.replace(/\D/g, '');
    const ifsc = ifscCode.trim().toUpperCase();

    if (!holder) {
      setError('Account holder name is required');
      return;
    }
    if (!acctNum) {
      setError('Account number is required');
      return;
    }
    if (!isValidAccountNumber(accountNumber)) {
      setError('Account number must be 9–18 digits');
      return;
    }
    if (!ifsc) {
      setError('IFSC code is required');
      return;
    }
    if (!isValidIFSC(ifscCode)) {
      setError('Invalid IFSC code. Use 11 characters (e.g. HDFC0001234)');
      return;
    }

    setAdding(true);
    try {
      const last4 = acctNum.slice(-4);
      await api.post<BankAccount>('/bank-accounts', {
        account_holder: holder,
        ifsc,
        account_number_last4: last4,
      });
      setAccountNumber('');
      setIfscCode('');
      setAccountHolderName('');
      await fetchAccounts();
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to add account');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
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
              onChangeText={(t) => setAccountNumber(t.replace(/\D/g, ''))}
              placeholder="9–18 digits"
              keyboardType="numeric"
              maxLength={18}
            />
            <Input
              label="IFSC Code"
              value={ifscCode}
              onChangeText={(t) => setIfscCode(t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 11))}
              placeholder="e.g. HDFC0001234"
              autoCapitalize="characters"
              maxLength={11}
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
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
