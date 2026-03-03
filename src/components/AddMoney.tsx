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
import { useBalance } from '../context/BalanceContext';
import { formatINR, formatAmountDisplay, parseAmountInput } from '../lib/utils';
import { colors } from '../theme/colors';

interface AddMoneyProps {
  isOpen: boolean;
  onClose: () => void;
}

type Method = 'upi' | 'netbanking';

const QUICK_AMOUNTS = [500, 1000, 5000];

export function AddMoney({ isOpen, onClose }: AddMoneyProps) {
  const { addBalance } = useBalance();
  const [amount, setAmount] = useState('0');
  const [method, setMethod] = useState<Method>('upi');
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (text: string) => {
    setAmount(formatAmountDisplay(text));
  };

  const handleAdd = () => {
    const amountNum = parseAmountInput(amount);
    if (amountNum > 0) {
      addBalance(amountNum);
    }
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
              <Text style={styles.successTitle}>Money Added!</Text>
              <Text style={styles.successSubtitle}>
                {formatINR(parseAmountInput(amount))} has been added to your wallet.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Ionicons name="wallet" size={24} color={colors.purple} />
                  <Text style={styles.headerTitle}>Add Money</Text>
                </View>
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
                <View style={styles.amountSection}>
                  <Text style={styles.amountLabel}>Enter Amount</Text>
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

                <View style={styles.quickAmounts}>
                  {QUICK_AMOUNTS.map((val) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setAmount(formatAmountDisplay(val.toString()))}
                      style={[
                        styles.quickBtn,
                        parseAmountInput(amount) === val && styles.quickBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickBtnText,
                          parseAmountInput(amount) === val && styles.quickBtnTextActive,
                        ]}
                      >
                        + {formatINR(val)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.methodSection}>
                  <Text style={styles.methodLabel}>Payment Method</Text>
                  <TouchableOpacity
                    onPress={() => setMethod('upi')}
                    style={[
                      styles.methodCard,
                      method === 'upi' && styles.methodCardActive,
                    ]}
                  >
                    <View style={styles.methodIconWrap}>
                      <Text style={styles.methodIconText}>UPI</Text>
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>UPI Apps</Text>
                      <Text style={styles.methodDesc}>
                        Google Pay, PhonePe, Paytm
                      </Text>
                    </View>
                    {method === 'upi' && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.purple}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMethod('netbanking')}
                    style={[
                      styles.methodCard,
                      method === 'netbanking' && styles.methodCardActive,
                    ]}
                  >
                    <View style={styles.methodIconWrap}>
                      <Ionicons
                        name="swap-horizontal"
                        size={18}
                        color={colors.gray600}
                      />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={styles.methodTitle}>IMPS Transfer</Text>
                      <Text style={styles.methodDesc}>
                        Instant bank transfer via IMPS
                      </Text>
                    </View>
                    {method === 'netbanking' && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={colors.purple}
                      />
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  onPress={handleAdd}
                  disabled={parseAmountInput(amount) === 0}
                  style={styles.addBtn}
                  size="lg"
                >
                  <Text style={styles.addBtnText}>
                    Add {amount ? formatINR(parseAmountInput(amount)) : ''}
                  </Text>
                </Button>
              </ScrollView>
            </>
          )}
        </View>
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray400,
    marginRight: 8,
  },
  amountInput: {
    fontSize: 44,
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
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  quickBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  quickBtnActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple50,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray600,
  },
  quickBtnTextActive: {
    color: colors.purple,
  },
  methodSection: {
    marginBottom: 32,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray100,
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple50,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  methodInfo: { flex: 1 },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.navy,
  },
  methodDesc: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  addBtn: {
    height: 56,
    width: '100%',
  },
  addBtnText: {
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
