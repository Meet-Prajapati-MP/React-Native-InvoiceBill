import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { AlertDialog } from './ui/AlertDialog';
import { useBalance } from '../context/BalanceContext';
import { formatINR, formatAmountDisplay, parseAmountInput } from '../lib/utils';
import { colors } from '../theme/colors';

interface WithdrawProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Withdraw({ isOpen, onClose }: WithdrawProps) {
  const { balance, deductBalance } = useBalance();
  const [amount, setAmount] = useState('0');
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (text: string) => {
    setAmount(formatAmountDisplay(text));
  };

  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const handleWithdraw = () => {
    const amountNum = parseAmountInput(amount);
    if (amountNum > balance) {
      setInsufficientBalance(true);
      return;
    }
    setInsufficientBalance(false);
    deductBalance(amountNum);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount(formatAmountDisplay('0'));
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setSuccess(false);
    setAmount(formatAmountDisplay('0'));
    onClose();
  };

  const amountNum = parseAmountInput(amount);
  const canWithdraw = amountNum > 0 && amountNum <= balance;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          {success ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={40} color={colors.green600} />
              </View>
              <Text style={styles.successTitle}>Withdrawal Initiated</Text>
              <Text style={styles.successSubtitle}>
                {formatINR(amountNum)} will be credited to your bank account
                within 2 hours.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Withdraw to Bank</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.gray600} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentInner}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceLabel}>Available Balance</Text>
                  <Text style={styles.balanceAmount}>{formatINR(balance)}</Text>
                </View>

                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>Amount to Withdraw</Text>
                  <View style={styles.amountRow}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      value={amount}
                      onChangeText={handleAmountChange}
                      keyboardType="numeric"
                      style={styles.amountInput}
                      autoFocus
                      {...(Platform.OS === 'android' && { includeFontPadding: false })}
                    />
                  </View>
                </View>

                <View style={styles.bankCard}>
                  <View style={styles.bankIconWrap}>
                    <Ionicons name="business" size={20} color={colors.blue600} />
                  </View>
                  <View style={styles.bankInfo}>
                    <Text style={styles.bankName}>HDFC Bank</Text>
                    <Text style={styles.bankDetail}>**** 1234 • Primary Account</Text>
                  </View>
                  <View style={styles.checkWrap}>
                    <Ionicons name="checkmark" size={14} color={colors.green600} />
                  </View>
                </View>

                <Button
                  onPress={handleWithdraw}
                  disabled={amountNum <= 0}
                  style={styles.withdrawBtn}
                  size="lg"
                >
                  <Text style={styles.withdrawBtnText}>
                    Withdraw {amountNum > 0 ? formatINR(amountNum) : ''}
                  </Text>
                </Button>
              </ScrollView>
            </>
          )}
        </View>

        <AlertDialog
          visible={insufficientBalance}
          title="Not Enough Balance"
          message={`You have ${formatINR(balance)} available. Please enter an amount within your balance.`}
          onOK={() => setInsufficientBalance(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
  },
  closeBtn: { padding: 8 },
  scrollContent: { flex: 1 },
  scrollContentInner: {
    padding: 24,
    paddingBottom: 40,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.gray500,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  amountLabel: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.gray400,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.navy,
    padding: 0,
    margin: 0,
    minWidth: 72,
    flex: 1,
    maxWidth: 260,
    textAlign: 'center',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 32,
  },
  bankIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  bankInfo: { flex: 1 },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
  },
  bankDetail: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawBtn: {
    height: 56,
    width: '100%',
  },
  withdrawBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.green100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
  },
});
