import React, { useState } from 'react';
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
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

interface BankAccountsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankAccountsPage({ isOpen, onClose }: BankAccountsPageProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

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
          {/* Linked Accounts */}
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          <Card style={styles.linkedCard}>
            <View style={styles.linkedRow}>
              <View style={styles.bankIconWrap}>
                <Ionicons name="business" size={24} color={colors.blue600} />
              </View>
              <View style={styles.linkedInfo}>
                <Text style={styles.bankName}>HDFC Bank</Text>
                <Text style={styles.accountMask}>**** 1234</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={colors.green600} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </Card>

          {/* Add New Account */}
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

          {/* Verification Banner */}
          <View style={styles.verifyBanner}>
            <Ionicons name="pulse" size={20} color={colors.blue600} />
            <Text style={styles.verifyBannerText}>
              We will deposit ₹1 to your account to verify ownership (Penny Drop Verification).
            </Text>
          </View>

          <Button onPress={() => {}} style={styles.verifyBtn}>
            Verify with Penny Drop
          </Button>
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
});
