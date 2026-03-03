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
import { DatePickerInput, formatDateForDisplay } from './ui/DatePickerInput';
import { Card } from './ui/Card';
import { CustomersPage } from '../pages/CustomersPage';
import { AlertDialog } from './ui/AlertDialog';
import { formatINR, formatAmountDisplay, parseAmountInput } from '../lib/utils';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface Milestone {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  initials: string;
  color: string;
}

interface SendInvoiceProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedCustomer?: Customer | null;
}

export function SendInvoice({
  isOpen,
  onClose,
  onSuccess,
  preselectedCustomer,
}: SendInvoiceProps) {
  const [step, setStep] = useState(preselectedCustomer ? 2 : 1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(preselectedCustomer || null);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-008');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [includeGST, setIncludeGST] = useState(true);
  const [items, setItems] = useState([{ id: 1, name: '', qty: 1, rate: 0 }]);
  const [paymentType, setPaymentType] = useState<'full' | 'milestone' | 'recurring'>('full');
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 1, name: 'Milestone 1', amount: 0, dueDate: '' },
    { id: 2, name: 'Milestone 2', amount: 0, dueDate: '' },
  ]);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(false);
  const [enableReminders, setEnableReminders] = useState(false);
  // Recurring-specific state
  const [recurringName, setRecurringName] = useState('');
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [generateOn, setGenerateOn] = useState<'day' | 'last'>('day');
  const [generateDay, setGenerateDay] = useState('1');
  const [recurringStartDate, setRecurringStartDate] = useState('');
  const [recurringEnds, setRecurringEnds] = useState<'never' | 'after' | 'ondate'>('never');
  const [recurringEndAfterCount, setRecurringEndAfterCount] = useState('');
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [paymentDueDays, setPaymentDueDays] = useState<'receipt' | '15' | '30' | '45' | '60'>('30');
  const [autoSend, setAutoSend] = useState(true);
  const [notifyBeforeSending, setNotifyBeforeSending] = useState(true);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState('3');
  const [isSending, setIsSending] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(preselectedCustomer ? 2 : 1);
      setSelectedCustomer(preselectedCustomer || null);
    }
  }, [isOpen, preselectedCustomer]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', qty: 1, rate: 0 }]);
  };
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { id: Date.now(), name: `Milestone ${milestones.length + 1}`, amount: 0, dueDate: '' },
    ]);
  };
  const removeMilestone = (id: number) => {
    if (milestones.length > 2) setMilestones(milestones.filter((m) => m.id !== id));
  };
  const updateMilestone = (id: number, field: string, value: string | number) => {
    setMilestones(milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const handleSendInvoice = async () => {
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
      number: invoiceNumber.trim() || `INV-${Date.now()}`,
      due_date: dueDate || undefined,
      notes: notes.trim() || undefined,
      include_gst: includeGST,
      payment_type: paymentType,
      recipient_phone: selectedCustomer.phone || undefined,
      recipient_email: (selectedCustomer as { email?: string }).email || undefined,
      items: validItems.map((item, idx) => ({
        name: item.name?.trim() || 'Item',
        qty: typeof item.qty === 'number' ? item.qty : 1,
        rate: typeof item.rate === 'number' ? item.rate : parseAmountInput(String(item.rate)) || 0,
        sort_order: idx,
      })),
    };
    try {
      setIsSending(true);
      await api.post('/invoices', payload);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string }; message?: string }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Failed to create invoice.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateRecurringInvoice = async () => {
    if (!selectedCustomer) {
      setAlertDialog({ title: 'Error', message: 'Please select a customer.' });
      return;
    }
    const validItems = items.filter((i) => i.name?.trim());
    if (validItems.length === 0) {
      setAlertDialog({ title: 'Error', message: 'Please add at least one item with a name.' });
      return;
    }
    if (!recurringName.trim()) {
      setAlertDialog({ title: 'Error', message: 'Recurring invoice name is required.' });
      return;
    }
    if (!recurringStartDate) {
      setAlertDialog({ title: 'Error', message: 'Start date is required.' });
      return;
    }
    const freqMap = {
      daily: 'DAILY' as const,
      weekly: 'WEEKLY' as const,
      monthly: 'MONTHLY' as const,
      quarterly: 'QUARTERLY' as const,
      yearly: 'YEARLY' as const,
    };
    const payload = {
      customer_id: selectedCustomer.id,
      recipient_phone: selectedCustomer.phone || undefined,
      recipient_email: (selectedCustomer as { email?: string }).email || undefined,
      number: invoiceNumber.trim() || `INV-REC-${Date.now()}`,
      name: recurringName.trim(),
      frequency: freqMap[recurringFrequency],
      generate_on: generateOn,
      generate_day: Math.min(31, Math.max(1, parseInt(generateDay, 10) || 1)),
      start_date: recurringStartDate,
      end_type: recurringEnds,
      end_after_count: recurringEnds === 'after' ? parseInt(recurringEndAfterCount, 10) || undefined : undefined,
      end_date: recurringEnds === 'ondate' && recurringEndDate ? recurringEndDate : undefined,
      payment_due_days: paymentDueDays === 'receipt' ? '0' : paymentDueDays,
      auto_send: autoSend,
      notify_before_sending: notifyBeforeSending,
      notify_days_before: parseInt(notifyDaysBefore, 10) || 3,
      include_gst: includeGST,
      notes: notes.trim() || undefined,
      items: validItems.map((item, idx) => ({
        name: item.name?.trim() || 'Item',
        qty: typeof item.qty === 'number' ? item.qty : 1,
        rate: typeof item.rate === 'number' ? item.rate : parseAmountInput(String(item.rate)) || 0,
        sort_order: idx,
      })),
    };
    try {
      setIsSending(true);
      await api.post('/recurring-invoices', payload);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })
        ?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Failed to create recurring invoice.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalSend = () => {
    if (paymentType === 'recurring') {
      handleCreateRecurringInvoice();
      return;
    }
    handleSendInvoice();
  };

  // Compute next 3 invoice dates for Schedule Preview
  const getNextInvoiceDates = (): string[] => {
    const base = recurringStartDate ? new Date(recurringStartDate + 'T12:00:00') : new Date();
    if (isNaN(base.getTime())) return [];
    const dates: string[] = [];
    const dayOfMonth = Math.min(31, Math.max(1, parseInt(generateDay, 10) || 1));
    for (let i = 0; i < 3; i++) {
      if (recurringFrequency === 'monthly') {
        let d: Date;
        if (generateOn === 'last') {
          d = new Date(base.getFullYear(), base.getMonth() + 1 + i, 0);
        } else {
          d = new Date(base.getFullYear(), base.getMonth() + i, dayOfMonth);
        }
        dates.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`);
      } else if (recurringFrequency === 'weekly') {
        const d = new Date(base);
        d.setDate(d.getDate() + i * 7);
        dates.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`);
      } else if (recurringFrequency === 'yearly') {
        const d = new Date(base.getFullYear() + i, base.getMonth(), generateOn === 'last' ? 0 : dayOfMonth);
        if (generateOn === 'last') d.setMonth(d.getMonth() + 1), d.setDate(0);
        dates.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`);
      } else if (recurringFrequency === 'quarterly') {
        const d = new Date(base);
        d.setMonth(d.getMonth() + (i + 1) * 3);
        dates.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`);
      } else {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        dates.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`);
      }
    }
    return dates;
  };
  const nextInvoiceDates = getNextInvoiceDates();

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const tax = includeGST ? subtotal * 0.18 : 0;
  const total = subtotal + tax;
  const milestoneAllocated = milestones.reduce((sum, m) => sum + (m.amount || 0), 0);
  const milestoneRemaining = total - milestoneAllocated;
  const milestonesValid = Math.abs(milestoneRemaining) < 1 && total > 0;

  const splitEqually = () => {
    if (milestones.length === 0 || total === 0) return;
    const per = Math.floor(total / milestones.length);
    const remainder = total - per * milestones.length;
    setMilestones(milestones.map((m, i) => ({ ...m, amount: i === 0 ? per + remainder : per })));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else onClose();
  };
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else onClose();
  };

  if (!isOpen) return null;

  return (
    <>
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
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

        {step === 2 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>Create Invoice</Text>
              <Text style={styles.stepSubtitle}>For {selectedCustomer?.name}</Text>
            </View>

            {/* Payment Type */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PAYMENT TYPE</Text>
              <View style={styles.typeRow}>
                {(
                  [
                    { key: 'full' as const, icon: 'cash-outline', label: 'Full Payment', sub: 'One-time' },
                    { key: 'milestone' as const, icon: 'layers-outline', label: 'Milestones', sub: 'Split pay' },
                    { key: 'recurring' as const, icon: 'refresh-outline', label: 'Recurring', sub: 'Auto-repeat' },
                  ] as const
                ).map(({ key, icon, label, sub }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setPaymentType(key)}
                    style={[styles.typeCard, paymentType === key && styles.typeCardActive]}
                  >
                    <View style={[styles.typeIcon, paymentType === key && styles.typeIconActive]}>
                      <Ionicons
                        name={icon as any}
                        size={18}
                        color={paymentType === key ? colors.white : colors.gray500}
                      />
                    </View>
                    <Text style={[styles.typeLabel, paymentType === key && styles.typeLabelActive]}>
                      {label}
                    </Text>
                    <Text style={styles.typeSub}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Invoice Meta */}
            <View style={styles.card}>
              <View style={styles.metaRow}>
                <View style={styles.metaField}>
                  <Input
                    label="Invoice No"
                    value={invoiceNumber}
                    onChangeText={setInvoiceNumber}
                  />
                </View>
                {paymentType === 'full' && (
                  <View style={styles.metaField}>
                    <DatePickerInput
                      label="Due Date"
                      value={dueDate}
                      onChangeText={setDueDate}
                      placeholder="Select date"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Recurring Settings */}
            {paymentType === 'recurring' && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>RECURRING SETTINGS</Text>
                  <View style={styles.card}>
                    <Input
                      label="Recurring Invoice Name"
                      value={recurringName}
                      onChangeText={setRecurringName}
                      placeholder="e.g. Monthly Retainer - Tech Solutions"
                    />
                    <Text style={styles.helperText}>Helps identify in your recurring list</Text>

                    <View style={styles.recurringField}>
                      <Text style={styles.inputLabel}>Frequency</Text>
                      <View style={styles.pillRow}>
                        {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((f) => (
                          <TouchableOpacity
                            key={f}
                            onPress={() => setRecurringFrequency(f)}
                            style={[styles.pill, recurringFrequency === f && styles.pillActive]}
                          >
                            <Text style={[styles.pillText, recurringFrequency === f && styles.pillTextActive]}>
                              {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {recurringFrequency === 'monthly' && (
                      <View style={styles.recurringField}>
                        <Text style={styles.inputLabel}>Generate on</Text>
                        <View style={styles.radioRow}>
                          <TouchableOpacity
                            onPress={() => setGenerateOn('day')}
                            style={styles.radioOption}
                          >
                            <View style={[styles.radio, generateOn === 'day' && styles.radioActive]}>
                              {generateOn === 'day' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioText}>Day</Text>
                            <TextInput
                              style={[styles.radioInput, generateOn !== 'day' && styles.radioInputDisabled]}
                              value={generateDay}
                              onChangeText={setGenerateDay}
                              keyboardType="number-pad"
                              maxLength={2}
                              editable={generateOn === 'day'}
                            />
                            <Text style={styles.radioText}>of each month</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setGenerateOn('last')}
                            style={styles.radioOption}
                          >
                            <View style={[styles.radio, generateOn === 'last' && styles.radioActive]}>
                              {generateOn === 'last' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioText}>Last day of month</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.recurringField}>
                      <DatePickerInput
                        label="Start Date"
                        value={recurringStartDate}
                        onChangeText={setRecurringStartDate}
                        placeholder="dd-mm-yyyy"
                      />
                    </View>

                    <View style={styles.recurringField}>
                      <Text style={styles.inputLabel}>Ends</Text>
                      <View style={styles.radioColumn}>
                        <TouchableOpacity onPress={() => setRecurringEnds('never')} style={styles.radioOption}>
                          <View style={[styles.radio, recurringEnds === 'never' && styles.radioActive]}>
                            {recurringEnds === 'never' && <View style={styles.radioDot} />}
                          </View>
                          <Text style={styles.radioText}>Never (Until cancelled)</Text>
                        </TouchableOpacity>
                        <View style={styles.radioOption}>
                          <TouchableOpacity
                            onPress={() => setRecurringEnds('after')}
                            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                          >
                            <View style={[styles.radio, recurringEnds === 'after' && styles.radioActive]}>
                              {recurringEnds === 'after' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioText}>After specific invoices</Text>
                          </TouchableOpacity>
                          {recurringEnds === 'after' && (
                            <TextInput
                              style={styles.smallInput}
                              value={recurringEndAfterCount}
                              onChangeText={setRecurringEndAfterCount}
                              placeholder="0"
                              keyboardType="number-pad"
                            />
                          )}
                        </View>
                        <View>
                          <TouchableOpacity onPress={() => setRecurringEnds('ondate')} style={styles.radioOption}>
                            <View style={[styles.radio, recurringEnds === 'ondate' && styles.radioActive]}>
                              {recurringEnds === 'ondate' && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioText}>On specific date</Text>
                          </TouchableOpacity>
                          {recurringEnds === 'ondate' && (
                            <View style={{ marginLeft: 30, marginTop: 8 }}>
                              <DatePickerInput
                                value={recurringEndDate}
                                onChangeText={setRecurringEndDate}
                                placeholder="Select date"
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Payment Due */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>PAYMENT DUE</Text>
                  <Text style={styles.helperText}>After each invoice is generated</Text>
                  <View style={styles.pillRowWrap}>
                    {(['receipt', '15', '30', '45', '60'] as const).map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setPaymentDueDays(d)}
                        style={[styles.duePill, paymentDueDays === d && styles.duePillActive]}
                      >
                        <Text style={[styles.duePillText, paymentDueDays === d && styles.duePillTextActive]}>
                          {d === 'receipt' ? 'Upon receipt' : `${d} days`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Auto-send & Notify */}
                <View style={styles.card}>
                  <View style={styles.toggleRow}>
                    <View>
                      <Text style={styles.toggleTitle}>Auto-send</Text>
                      <Text style={styles.toggleSub}>Send automatically when generated</Text>
                    </View>
                    <Switch
                      value={autoSend}
                      onValueChange={setAutoSend}
                      trackColor={{ false: colors.gray200, true: colors.purple }}
                      thumbColor={colors.white}
                    />
                  </View>
                  <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 16, marginTop: 16 }]}>
                    <View>
                      <Text style={styles.toggleTitle}>Notify before sending</Text>
                      <Text style={styles.toggleSub}>Preview invoice before it's sent</Text>
                    </View>
                    <Switch
                      value={notifyBeforeSending}
                      onValueChange={setNotifyBeforeSending}
                      trackColor={{ false: colors.gray200, true: colors.purple }}
                      thumbColor={colors.white}
                    />
                  </View>
                  {notifyBeforeSending && (
                    <View style={styles.remindRow}>
                      <Ionicons name="notifications-outline" size={18} color={colors.gray500} />
                      <Text style={styles.remindLabel}>Remind</Text>
                      <TextInput
                        style={styles.remindInput}
                        value={notifyDaysBefore}
                        onChangeText={setNotifyDaysBefore}
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                      <Text style={styles.remindLabel}>days before</Text>
                    </View>
                  )}
                </View>

                {/* Schedule Preview */}
                <View style={[styles.card, styles.schedulePreview]}>
                  <View style={styles.scheduleHeader}>
                    <Ionicons name="calendar-outline" size={18} color={colors.purple} />
                    <Text style={styles.scheduleTitle}>Schedule Preview</Text>
                  </View>
                  <Text style={styles.scheduleSub}>
                    {recurringFrequency === 'monthly' && generateOn === 'day' && `Day ${generateDay} of every month`}
                    {recurringFrequency === 'monthly' && generateOn === 'last' && 'Last day of every month'}
                    {recurringFrequency === 'weekly' && 'Every week'}
                    {recurringFrequency === 'daily' && 'Every day'}
                    {recurringFrequency === 'quarterly' && 'Every quarter'}
                    {recurringFrequency === 'yearly' && `Yearly on day ${generateDay}`}
                  </Text>
                  <Text style={styles.scheduleNext}>Next 3 invoices:</Text>
                  {nextInvoiceDates.map((d, i) => (
                    <Text key={i} style={styles.scheduleDate}>{d}</Text>
                  ))}
                </View>
              </>
            )}

            {/* Milestone Builder */}
            {paymentType === 'milestone' && (
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>PAYMENT SCHEDULE</Text>
                  {!milestonesValid && total > 0 && (
                    <TouchableOpacity onPress={splitEqually}>
                      <Text style={styles.splitBtn}>Split Equally</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {total > 0 && (
                  <View style={styles.card}>
                    <View style={styles.allocRow}>
                      <Text style={styles.allocLabel}>Allocated</Text>
                      <Text
                        style={[
                          styles.allocValue,
                          milestonesValid && { color: colors.green600 },
                          milestoneRemaining < 0 && { color: colors.red500 },
                        ]}
                      >
                        {formatINR(milestoneAllocated)} / {formatINR(total)}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min((milestoneAllocated / total) * 100, 100)}%`,
                          },
                          milestonesValid && styles.progressGreen,
                          milestoneRemaining < 0 && styles.progressRed,
                        ]}
                      />
                    </View>
                  </View>
                )}
                {milestones.map((ms, i) => (
                  <View key={ms.id} style={styles.milestoneCard}>
                    <View style={styles.milestoneHeader}>
                      <View style={styles.milestoneNum}>
                        <Text style={styles.milestoneNumText}>{i + 1}</Text>
                      </View>
                      <View style={styles.milestoneNameWrap}>
                        <Input
                          placeholder="e.g. Design Phase"
                          value={ms.name}
                          onChangeText={(t) => updateMilestone(ms.id, 'name', t)}
                        />
                      </View>
                      {milestones.length > 2 && (
                        <TouchableOpacity onPress={() => removeMilestone(ms.id)}>
                          <Ionicons name="trash-outline" size={18} color={colors.gray400} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.milestoneRow}>
                      <View style={styles.milestoneField}>
                        <Input
                          label="Amount (₹)"
                          value={ms.amount ? formatAmountDisplay(String(ms.amount)) : ''}
                          onChangeText={(t) => updateMilestone(ms.id, 'amount', parseAmountInput(t) || 0)}
                          placeholder="0"
                        />
                      </View>
                      <View style={styles.milestoneField}>
                        <DatePickerInput
                          label="Due Date"
                          value={ms.dueDate}
                          onChangeText={(t) => updateMilestone(ms.id, 'dueDate', t)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
                <Button variant="outline" onPress={addMilestone} style={styles.addBtn}>
                  <Ionicons name="add-outline" size={16} color={colors.purple} />
                  <Text style={styles.addBtnText}> Add Milestone</Text>
                </Button>
              </View>
            )}

            {/* Line Items */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>LINE ITEMS</Text>
                {paymentType === 'recurring' && (
                  <TouchableOpacity style={styles.savedItemsBtn}>
                    <Text style={styles.savedItemsText}>Saved Items</Text>
                    <Ionicons name="chevron-down-outline" size={16} color={colors.gray500} />
                  </TouchableOpacity>
                )}
              </View>
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
                        value={item.rate ? formatAmountDisplay(String(item.rate)) : ''}
                        onChangeText={(t) => updateItem(item.id, 'rate', parseAmountInput(t) || 0)}
                      />
                    </View>
                  </View>
                </View>
              ))}
              <Button variant="outline" onPress={addItem} style={styles.addBtn}>
                <Ionicons name="add-outline" size={16} color={colors.purple} />
                <Text style={styles.addBtnText}> Add Item</Text>
              </Button>
            </View>

            {/* GST Toggle */}
            <View style={[styles.card, styles.toggleRow]}>
              <View>
                <Text style={styles.toggleTitle}>Include GST (18%)</Text>
                <Text style={styles.toggleSub}>Tax added to total</Text>
              </View>
              <Switch
                value={includeGST}
                onValueChange={setIncludeGST}
                trackColor={{ false: colors.gray200, true: colors.purple }}
                thumbColor={colors.white}
              />
            </View>

            {/* Totals */}
            <Card style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>{formatINR(subtotal)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>GST (18%)</Text>
                <Text style={styles.totalValue}>{includeGST ? formatINR(tax) : '₹0'}</Text>
              </View>
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
                placeholder="Payment terms, notes, or special instructions..."
                placeholderTextColor={colors.gray400}
                style={styles.notesInput}
                multiline
              />
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {step === 3 && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.reviewHeader}>
              <View style={styles.reviewIcon}>
                <Ionicons name="checkmark" size={32} color={colors.purple} />
              </View>
              <Text style={styles.reviewTitle}>Review Invoice</Text>
              <Text style={styles.reviewSubtitle}>
                Ready to send to {selectedCustomer?.name}
              </Text>
            </View>

            <Card style={styles.reviewCard}>
              <View style={styles.reviewAmountRow}>
                <Text style={styles.reviewLabel}>Amount Due</Text>
                <View style={styles.reviewAmountWrap}>
                  <Text style={styles.reviewAmount}>{formatINR(total)}</Text>
                  <TouchableOpacity onPress={() => setStep(2)}>
                    <Ionicons name="create-outline" size={18} color={colors.purple} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.reviewBadge}>
                <View style={styles.reviewBadgeIcon}>
                  <Ionicons
                    name={paymentType === 'full' ? 'cash' : 'layers'}
                    size={14}
                    color={colors.purple}
                  />
                </View>
                <View>
                  <Text style={styles.reviewBadgeTitle}>
                    {paymentType === 'full'
                      ? 'Full Payment'
                      : paymentType === 'milestone'
                        ? `${milestones.length} Milestones`
                        : 'Recurring'}
                  </Text>
                  <Text style={styles.reviewBadgeSub}>
                    {paymentType === 'full'
                      ? `Due: ${dueDate ? formatDateForDisplay(dueDate) : 'Not set'}`
                      : paymentType === 'milestone'
                        ? `Split into ${milestones.length} payments`
                        : `${recurringFrequency.charAt(0).toUpperCase() + recurringFrequency.slice(1)}, Due: ${paymentDueDays === 'receipt' ? 'Upon receipt' : paymentDueDays + ' days'}`}
                  </Text>
                </View>
              </View>
              <View style={styles.reviewItems}>
                <Text style={styles.reviewItemsTitle}>Items</Text>
                {items.map((item) => (
                  <View key={item.id} style={styles.reviewItemRow}>
                    <Text style={styles.reviewItemName}>
                      {item.name || 'Item'} x{item.qty}
                    </Text>
                    <Text style={styles.reviewItemAmount}>
                      {formatINR(item.rate * item.qty)}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            <Card style={styles.deliveryCard}>
              <Text style={styles.deliveryTitle}>Send Invoice Via</Text>
              <View style={styles.deliveryRow}>
                <View style={styles.deliveryIconWrap}>
                  <Ionicons name="notifications-outline" size={14} color={colors.purple} />
                </View>
                <Text style={styles.deliveryText}>App Notification</Text>
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
                    <Ionicons name="mail-outline" size={14} color={colors.blue600} />
                  </View>
                  <Text style={styles.deliveryText}>Email</Text>
                </View>
                <View
                  style={[styles.deliveryBox, sendViaEmail && styles.deliveryBoxActive]}
                >
                  {sendViaEmail && (
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  )}
                </View>
              </TouchableOpacity>
            </Card>

            <Card style={styles.reminderCard}>
              <View style={styles.reminderRow}>
                <View>
                  <Text style={styles.reminderTitle}>Payment Reminders</Text>
                  <Text style={styles.reminderSub}>
                    Automatically send reminders before due date
                  </Text>
                </View>
                <Switch
                  value={enableReminders}
                  onValueChange={setEnableReminders}
                  trackColor={{ false: colors.gray200, true: colors.purple }}
                  thumbColor={colors.white}
                />
              </View>
            </Card>

            <Button variant="outline" onPress={() => setStep(2)} style={styles.editBtn}>
              Edit Invoice Details
            </Button>
            <Button
              onPress={handleFinalSend}
              disabled={isSending}
              style={styles.sendBtn}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                paymentType === 'recurring' ? 'Create Recurring Invoice' : 'Send Invoice'
              )}
            </Button>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}

        {step === 2 && (
          <View style={styles.footer}>
            <Button
              onPress={handleNext}
              disabled={
                paymentType === 'milestone' && !milestonesValid && total > 0
              }
              style={styles.footerBtn}
            >
              {paymentType === 'milestone' && !milestonesValid && total > 0
                ? 'Allocate milestone amounts to continue'
                : paymentType === 'recurring'
                  ? 'Create Recurring Invoice'
                  : 'Continue'}
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
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerBtn: { padding: 8, marginLeft: -8 },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray200 },
  dotActive: { backgroundColor: colors.purple },
  dotDone: { backgroundColor: colors.purple + '66' },
  headerSpacer: { width: 40 },
  stepContent: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  stepHeader: { marginBottom: 24 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  stepSubtitle: { fontSize: 14, color: colors.gray500 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray500,
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  splitBtn: { fontSize: 10, fontWeight: '700', color: colors.purple },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  typeCardActive: {
    borderColor: colors.purple,
    backgroundColor: colors.purple50,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconActive: { backgroundColor: colors.purple },
  typeLabel: { fontSize: 12, fontWeight: '700', color: colors.navy },
  typeLabelActive: { color: colors.purple },
  typeSub: { fontSize: 9, color: colors.gray500, marginTop: 2 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 16,
  },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaField: { flex: 1 },
  allocRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  allocLabel: { fontSize: 11, fontWeight: '500', color: colors.gray500 },
  allocValue: { fontSize: 11, fontWeight: '700', color: colors.amber500 },
  progressBar: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.amber500,
    borderRadius: 3,
  },
  progressGreen: { backgroundColor: colors.green600 },
  progressRed: { backgroundColor: colors.red500 },
  milestoneCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 16,
    marginBottom: 12,
  },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  milestoneNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  milestoneNumText: { fontSize: 10, fontWeight: '700', color: colors.white },
  milestoneNameWrap: { flex: 1, marginBottom: -8 },
  milestoneRow: { flexDirection: 'row', gap: 12 },
  milestoneField: { flex: 1 },
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addBtnText: { color: colors.purple, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: { fontSize: 16, fontWeight: '600', color: colors.navy },
  toggleSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  totalsCard: { padding: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalLabel: { fontSize: 14, color: colors.gray500 },
  totalValue: { fontSize: 14, color: colors.navy },
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
    backgroundColor: colors.purple100,
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
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  reviewBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.purple100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewBadgeTitle: { fontSize: 14, fontWeight: '600', color: colors.navy },
  reviewBadgeSub: { fontSize: 10, color: colors.gray500, marginTop: 2 },
  reviewItems: { paddingTop: 16 },
  reviewItemsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray500,
    letterSpacing: 1,
    marginBottom: 12,
  },
  reviewItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewItemName: { fontSize: 14, color: colors.gray700 },
  reviewItemAmount: { fontSize: 14, fontWeight: '600', color: colors.navy },
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
  deliveryText: { fontSize: 14, fontWeight: '500', color: colors.navy },
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
  deliveryBoxActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  reminderCard: { padding: 20, marginBottom: 16 },
  reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reminderTitle: { fontSize: 16, fontWeight: '600', color: colors.navy },
  reminderSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  editBtn: { marginBottom: 12 },
  sendBtn: { height: 56 },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
  },
  footerBtn: { height: 48 },
  helperText: { fontSize: 11, color: colors.gray500, marginTop: 4, marginBottom: 8 },
  recurringField: { marginTop: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  pillActive: { borderColor: colors.purple, backgroundColor: colors.purple50 },
  pillText: { fontSize: 14, color: colors.gray600 },
  pillTextActive: { color: colors.purple, fontWeight: '600' },
  radioRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  radioColumn: { gap: 12 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioActive: { borderColor: colors.purple },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.purple,
  },
  radioText: { fontSize: 14, color: colors.navy },
  radioInput: {
    width: 36,
    height: 32,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 6,
    marginHorizontal: 6,
    textAlign: 'center',
    fontSize: 14,
    color: colors.navy,
  },
  radioInputDisabled: { backgroundColor: colors.gray50, color: colors.gray400 },
  smallInput: {
    width: 48,
    height: 32,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 6,
    marginLeft: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: colors.navy,
  },
  pillRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  duePill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  duePillActive: { borderColor: colors.purple, backgroundColor: colors.purple, borderWidth: 0 },
  duePillText: { fontSize: 13, color: colors.gray600 },
  duePillTextActive: { color: colors.white, fontWeight: '600' },
  remindRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  remindLabel: { fontSize: 14, color: colors.gray600 },
  remindInput: {
    width: 40,
    height: 36,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    color: colors.navy,
  },
  schedulePreview: { backgroundColor: colors.blue50, borderColor: colors.blue100 },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  scheduleTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
  scheduleSub: { fontSize: 12, color: colors.gray600, marginBottom: 12 },
  scheduleNext: { fontSize: 11, fontWeight: '600', color: colors.gray500, marginBottom: 4 },
  scheduleDate: { fontSize: 14, color: colors.navy, marginBottom: 2 },
  savedItemsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedItemsText: { fontSize: 12, color: colors.gray600 },
});
