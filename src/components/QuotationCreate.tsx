import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { DatePickerInput } from './ui/DatePickerInput';
import { Card } from './ui/Card';
import { CustomersPage } from '../pages/CustomersPage';
import { AlertDialog } from './ui/AlertDialog';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { useInvoiceSettings } from '../context/InvoiceSettingsContext';

interface CreateQuotationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function CreateQuotationFlow({ isOpen, onClose, onSuccess }: CreateQuotationFlowProps) {
  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const [quoteNumber, setQuoteNumber] = useState('QUO-007');
  const [quoteDate, setQuoteDate] = useState(toISODate(new Date()));
  const [validUntil, setValidUntil] = useState(
    toISODate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  );
  const [notes, setNotes] = useState('');
  const [includeGST, setIncludeGST] = useState(true);
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState([{ id: 1, name: '', qty: 1, rate: 0 }]);

  const [showSavedItems, setShowSavedItems] = useState(false);
  const savedItems = [
    { id: 1, name: 'Website Design', rate: 15000 },
    { id: 2, name: 'Logo Design', rate: 5000 },
    { id: 3, name: 'Consulting', rate: 8000 },
  ];

  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const invoiceSettings = useInvoiceSettings();

  useEffect(() => {
    if (isOpen) {
      invoiceSettings?.getNextQuoteNumber().then((num) => setQuoteNumber(num));
    }
  }, [isOpen, invoiceSettings]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, rate: 0 }]);
  };
  const addSavedItem = (savedItem: { name: string; rate: number }) => {
    setItems([
      ...items,
      { id: Date.now(), name: savedItem.name, qty: 1, rate: savedItem.rate },
    ]);
    setShowSavedItems(false);
  };
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountAmount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = includeGST ? taxableAmount * 0.18 : 0;
  const total = taxableAmount + tax;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const saveQuotation = async (status: 'draft' | 'sent') => {
    if (!selectedCustomer) {
      setAlertDialog({ title: 'Error', message: 'Please select a customer.' });
      return;
    }
    const validItems = items.filter((i) => i.name?.trim());
    if (validItems.length === 0) {
      setAlertDialog({ title: 'Error', message: 'Please add at least one item with a name.' });
      return;
    }
    const payload = {
      customer_id: selectedCustomer.id,
      quo_number: quoteNumber.trim() || `QUO-${Date.now()}`,
      client_name: selectedCustomer.name,
      amount: total,
      date: quoteDate || undefined,
      valid_until: validUntil || undefined,
      status,
      type: 'sent' as const,
      items: validItems.map((item, idx) => ({
        name: item.name?.trim() || 'Item',
        qty: typeof item.qty === 'number' ? item.qty : 1,
        rate: typeof item.rate === 'number' ? item.rate : Number(item.rate) || 0,
        sort_order: idx,
      })),
    };
    try {
      setIsSaving(true);
      await api.post('/quotations', payload);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save quotation.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  if (!isOpen) return null;

  return (
    <>
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={handleBack}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <View style={styles.stepDots}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={[
                  styles.dot,
                  s === step && styles.dotActive,
                  s < step && styles.dotDone,
                ]}
              />
            ))}
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step 1: Select Customer */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <CustomersPage
              mode="select"
              onSelectCustomer={(c) => {
                setSelectedCustomer(c);
                setStep(2);
              }}
            />
          </View>
        )}

        {/* Step 2: Quote Details */}
        {step === 2 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>New Quotation</Text>
              <Text style={styles.stepSubtitle}>For {selectedCustomer?.name}</Text>
            </View>

            {/* Quote Meta */}
            <View style={styles.card}>
              <Input
                label="Quote Number"
                value={quoteNumber}
                onChangeText={setQuoteNumber}
              />
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <DatePickerInput
                    label="Quote Date"
                    value={quoteDate}
                    onChangeText={setQuoteDate}
                    placeholder="Select date"
                  />
                </View>
                <View style={styles.dateField}>
                  <DatePickerInput
                    label="Valid Until"
                    value={validUntil}
                    onChangeText={setValidUntil}
                    placeholder="Select date"
                  />
                </View>
              </View>
            </View>

            {/* Line Items */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>LINE ITEMS</Text>
                <TouchableOpacity
                  onPress={() => setShowSavedItems(!showSavedItems)}
                  style={styles.savedItemsBtn}
                >
                  <Text style={styles.savedItemsText}>Saved Items</Text>
                  <Ionicons
                    name={showSavedItems ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.purple}
                  />
                </TouchableOpacity>
              </View>
              {showSavedItems && (
                <View style={styles.savedItemsPanel}>
                  {savedItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => addSavedItem(item)}
                      style={styles.savedItemRow}
                    >
                      <Text style={styles.savedItemName}>{item.name}</Text>
                      <Text style={styles.savedItemRate}>{formatINR(item.rate)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {items.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.gray400} />
                    </TouchableOpacity>
                  )}
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChangeText={(t) => updateItem(item.id, 'name', t)}
                  />
                  <View style={styles.itemRow}>
                    <View style={styles.itemQty}>
                      <Input
                        placeholder="Qty"
                        value={String(item.qty)}
                        onChangeText={(t) => updateItem(item.id, 'qty', Number(t) || 1)}
                      />
                    </View>
                    <View style={styles.itemRate}>
                      <Input
                        placeholder="Rate (₹)"
                        value={item.rate ? String(item.rate) : ''}
                        onChangeText={(t) => updateItem(item.id, 'rate', Number(t) || 0)}
                      />
                    </View>
                  </View>
                </View>
              ))}
              <Button variant="outline" onPress={addItem} style={styles.addBtn}>
                <Ionicons name="add" size={16} color={colors.purple} />
                <Text style={styles.addBtnText}> Add Item</Text>
              </Button>
            </View>

            {/* Totals */}
            <Card style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatINR(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <TextInput
                  placeholder="0"
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="numeric"
                  style={styles.discountInput}
                />
              </View>
              <View style={[styles.toggleRow, styles.gstRow]}>
                <Text style={styles.totalLabel}>GST (18%)</Text>
                <Switch
                  value={includeGST}
                  onValueChange={setIncludeGST}
                  trackColor={{ false: colors.gray200, true: colors.purple }}
                  thumbColor={colors.white}
                />
              </View>
              {includeGST && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax Amount</Text>
                  <Text style={styles.totalValue}>{formatINR(tax)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.totalFinal]}>
                <Text style={styles.totalFinalLabel}>Total</Text>
                <Text style={styles.totalFinalValue}>{formatINR(total)}</Text>
              </View>
            </Card>

            {/* Notes */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>NOTES & TERMS</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Terms, conditions, or notes..."
                placeholderTextColor={colors.gray400}
                style={styles.notesInput}
                multiline
              />
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewIcon, { backgroundColor: colors.green50 }]}>
                <Ionicons name="document-text" size={32} color={colors.green600} />
              </View>
              <Text style={styles.reviewTitle}>Review Quotation</Text>
              <Text style={styles.reviewSubtitle}>
                Ready to send to {selectedCustomer?.name}
              </Text>
            </View>

            <Card style={styles.reviewCard}>
              <View style={styles.reviewAmountRow}>
                <Text style={styles.reviewLabel}>Total Amount</Text>
                <View style={styles.reviewAmountWrap}>
                  <Text style={styles.reviewAmount}>{formatINR(total)}</Text>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Ionicons name="create-outline" size={18} color={colors.purple} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.reviewMeta}>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewMetaLabel}>Quote No</Text>
                  <Text style={styles.reviewMetaValue}>{quoteNumber}</Text>
                </View>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewMetaLabel}>Valid Until</Text>
                  <Text style={styles.reviewMetaValue}>{validUntil}</Text>
                </View>
                <View style={styles.reviewMetaRow}>
                  <Text style={styles.reviewMetaLabel}>Items</Text>
                  <Text style={styles.reviewMetaValue}>{items.length} items</Text>
                </View>
              </View>
            </Card>

            {/* Delivery Channels */}
            <Card style={styles.deliveryCard}>
              <Text style={styles.deliveryTitle}>Send Quote Via</Text>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryLeft}>
                  <View style={styles.deliveryIconWrap}>
                    <Ionicons name="notifications" size={14} color={colors.purple} />
                  </View>
                  <View style={styles.deliveryTextWrap}>
                    <Text style={styles.deliveryText}>App Notification</Text>
                    <Text style={styles.deliverySub}>Mandatory</Text>
                  </View>
                </View>
                <View style={styles.deliveryCheck}>
                  <Ionicons name="checkmark" size={12} color={colors.white} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.deliveryRow}
                onPress={() => setSendViaWhatsApp(!sendViaWhatsApp)}
              >
                <View style={styles.deliveryLeft}>
                  <View style={[styles.deliveryIconWrap, { backgroundColor: colors.green100 }]}>
                    <Ionicons name="logo-whatsapp" size={14} color={colors.green600} />
                  </View>
                  <Text style={styles.deliveryText}>WhatsApp</Text>
                </View>
                <View
                  style={[
                    styles.deliveryBox,
                    sendViaWhatsApp && styles.deliveryBoxActive,
                  ]}
                >
                  {sendViaWhatsApp && (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deliveryRow}
                onPress={() => setSendViaEmail(!sendViaEmail)}
              >
                <View style={styles.deliveryLeft}>
                  <View style={[styles.deliveryIconWrap, { backgroundColor: colors.blue100 }]}>
                    <Ionicons name="mail" size={14} color={colors.blue600} />
                  </View>
                  <Text style={styles.deliveryText}>Email</Text>
                </View>
                <View
                  style={[
                    styles.deliveryBox,
                    sendViaEmail && styles.deliveryBoxActive,
                  ]}
                >
                  {sendViaEmail && (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            </Card>

            <View style={styles.reviewActions}>
              <Button
                variant="outline"
                onPress={() => saveQuotation('draft')}
                disabled={isSaving}
                style={styles.saveDraftBtn}
              >
                {isSaving ? <ActivityIndicator size="small" color={colors.purple} /> : 'Save Draft'}
              </Button>
              <Button
                onPress={() => saveQuotation('sent')}
                disabled={isSaving}
                style={styles.sendBtn}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  'Send Quote'
                )}
              </Button>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {/* Footer (step 2 only) */}
        {step === 2 && (
          <View style={styles.footer}>
            <Button onPress={handleNext} style={styles.footerBtn}>
              Continue
            </Button>
          </View>
        )}
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
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerBtn: { padding: 8, marginLeft: -8 },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray200,
  },
  dotActive: { backgroundColor: colors.purple },
  dotDone: { backgroundColor: colors.purple + '66' },
  headerSpacer: { width: 40 },
  stepContent: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  stepHeader: { marginBottom: 24 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: colors.gray500 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 16,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray500,
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  savedItemsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedItemsText: { fontSize: 12, fontWeight: '600', color: colors.purple },
  savedItemsPanel: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 12,
    overflow: 'hidden',
  },
  savedItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  savedItemName: { fontSize: 14, fontWeight: '500', color: colors.navy },
  savedItemRate: { fontSize: 12, color: colors.gray500 },
  dateRow: { flexDirection: 'row', gap: 16 },
  dateField: { flex: 1 },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  removeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 1 },
  itemRow: { flexDirection: 'row', gap: 12 },
  itemQty: { width: 100 },
  itemRate: { flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', marginTop: 8 },
  addBtnText: { color: colors.purple, fontWeight: '600' },
  totalsCard: { padding: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: colors.gray500 },
  totalValue: { fontSize: 14, color: colors.navy },
  discountInput: {
    width: 80,
    height: 36,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'right',
    fontSize: 14,
    color: colors.navy,
  },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gstRow: { marginBottom: 8 },
  totalFinal: {
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  totalFinalLabel: { fontSize: 18, fontWeight: '700', color: colors.navy },
  totalFinalValue: { fontSize: 18, fontWeight: '700', color: colors.navy },
  notesInput: {
    height: 80,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.navy,
  },
  reviewHeader: { alignItems: 'center', marginBottom: 24, marginTop: 16 },
  reviewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  reviewTitle: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  reviewSubtitle: { fontSize: 16, color: colors.gray500 },
  reviewCard: { padding: 20, marginBottom: 16 },
  reviewAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  reviewLabel: { fontSize: 14, color: colors.gray500 },
  reviewAmountWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reviewAmount: { fontSize: 24, fontWeight: '700', color: colors.navy },
  reviewMeta: { paddingTop: 16 },
  reviewMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reviewMetaLabel: { fontSize: 14, color: colors.gray500 },
  reviewMetaValue: { fontSize: 14, fontWeight: '600', color: colors.navy },
  deliveryCard: { padding: 20, marginBottom: 16 },
  deliveryTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 16 },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  deliveryLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  deliveryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.purple100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryTextWrap: { flex: 1 },
  deliveryText: { fontSize: 14, fontWeight: '500', color: colors.navy },
  deliverySub: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  deliveryCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryBoxActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  reviewActions: { flexDirection: 'row', gap: 12 },
  saveDraftBtn: { flex: 1 },
  sendBtn: { flex: 2, height: 48 },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
  },
  footerBtn: { height: 48 },
});
