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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

interface Recipient {
  name?: string;
  phone?: string;
  initials?: string;
  color?: string;
}

interface TransferProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: Recipient;
}

export function Transfer({ isOpen, onClose, recipient }: TransferProps) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');

  const handleAmountChange = (text: string) => {
    if (!text) {
      setAmount('0');
      return;
    }
    if (amount === '0' && text.length === 2 && text[0] === '0') {
      setAmount(text[1]);
    } else {
      setAmount(text);
    }
  };

  const handlePay = () => {
    setStep(3);
    setTimeout(() => {
      setStep(1);
      setAmount('0');
      setNote('');
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setAmount('0');
    setNote('');
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
          {step === 3 ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark" size={48} color={colors.green600} />
              </View>
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successSubtitle}>
                {formatINR(Number(amount) || 0)} sent to{' '}
                {recipient?.name || 'Recipient'}
              </Text>
              <Button onPress={handleClose} style={styles.doneBtn}>
                Done
              </Button>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Send Payment</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={colors.gray600} />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.recipientCard}>
                  <View
                    style={[
                      styles.recipientAvatar,
                      recipient?.color && { backgroundColor: recipient.color },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recipientInitials,
                        recipient?.color && { color: colors.white },
                      ]}
                    >
                      {recipient?.initials || recipient?.name?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>
                      {recipient?.name || 'Select Recipient'}
                    </Text>
                    <Text style={styles.recipientPhone}>
                      {recipient?.phone || 'Enter UPI ID'}
                    </Text>
                  </View>
                </View>

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
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Add a note (optional)"
                    placeholderTextColor={colors.gray400}
                    style={styles.noteInput}
                  />
                </View>

                <Button
                  onPress={handlePay}
                  disabled={Number(amount || '0') === 0}
                  style={styles.payBtn}
                  size="lg"
                >
                  <Text style={styles.payBtnText}>
                    Pay {amount ? formatINR(Number(amount) || 0) : ''}
                  </Text>
                </Button>
              </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
  },
  closeBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  recipientInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray600,
  },
  recipientInfo: { flex: 1 },
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
  amountSection: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 32,
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
    width: 140,
    textAlign: 'center',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  noteInput: {
    fontSize: 16,
    color: colors.gray600,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 280,
    textAlign: 'center',
  },
  payBtn: {
    height: 56,
    width: '100%',
  },
  payBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
    marginBottom: 32,
    textAlign: 'center',
  },
  doneBtn: {
    width: '100%',
    maxWidth: 280,
    height: 48,
  },
});
