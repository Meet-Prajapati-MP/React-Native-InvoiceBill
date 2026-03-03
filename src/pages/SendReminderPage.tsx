import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SelectInput } from '../components/SelectInput';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

interface SendReminderPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  { id: 'gentle', label: '💼 Gentle Reminder (Due Soon)', desc: 'For invoices approaching due date' },
  { id: 'friendly', label: '⏰ Friendly Reminder (Just Due)', desc: 'For invoices just past due date' },
  { id: 'overdue', label: '📅 Payment Overdue (7-15 days)', desc: 'For invoices 1-2 weeks overdue' },
  { id: 'urgent', label: '⚠️ Urgent: Payment Required', desc: 'For invoices 2-4 weeks overdue' },
  { id: 'final', label: '🚨 Final Notice (30+ days)', desc: 'For invoices over 1 month overdue' },
  { id: 'custom', label: '💬 Custom Message', desc: 'Write your own reminder' },
];

const TEMPLATE_CONTENT: Record<string, { subject: string; body: string }> = {
  gentle: {
    subject: 'Friendly Reminder: Invoice {invoice_number} Due Soon',
    body: 'Hi {client_name},\n\nI hope this message finds you well.\n\nThis is a gentle reminder that Invoice {invoice_number} for {amount} is due on {due_date}, which is coming up soon.\n\nYou can view and pay the invoice here: {payment_link}\n\nIf you have any questions or need more time, please let me know.\n\nBest regards,\n{your_name}',
  },
  friendly: {
    subject: 'Payment Reminder: Invoice {invoice_number}',
    body: 'Hi {client_name},\n\nI wanted to reach out regarding Invoice {invoice_number} for {amount}, which was due on {due_date}.\n\nI understand things can get busy, so this is just a friendly reminder to process the payment when you get a chance.\n\nPayment Link: {payment_link}\n\nThank you!\n{your_name}',
  },
  overdue: {
    subject: 'Overdue Payment: Invoice {invoice_number}',
    body: 'Dear {client_name},\n\nThis is a reminder that Invoice {invoice_number} for {amount} is now {days_overdue} days overdue.\n\nPlease arrange payment as soon as possible. If there are any issues with the invoice, please contact me immediately.\n\nPayment Link: {payment_link}\n\nThank you for your prompt attention.\n{your_name}',
  },
  urgent: {
    subject: 'URGENT: Overdue Invoice {invoice_number} - Payment Required',
    body: 'Dear {client_name},\n\nI am writing regarding Invoice {invoice_number} for {amount}, which is now {days_overdue} days overdue.\n\nDespite previous reminders, we have not received payment. We require immediate payment to avoid additional late fees or service suspension.\n\nPayment Link: {payment_link}\n\n{your_name}',
  },
  final: {
    subject: 'FINAL NOTICE: Invoice {invoice_number} - Immediate Action Required',
    body: 'Dear {client_name},\n\nThis is our final notice regarding Invoice {invoice_number} for {amount}.\n\nIf full payment is not received within 7 business days, we will be forced to initiate collection proceedings.\n\nPayment Link: {payment_link}\n\nThis is a serious matter requiring your immediate attention.\n{your_name}',
  },
  custom: {
    subject: 'Regarding Invoice {invoice_number}',
    body: 'Hi {client_name},\n\n[Write your message here]\n\nInvoice: {invoice_number}\nAmount: {amount}\n\nLink: {payment_link}\n\nThanks,\n{your_name}',
  },
};

const MOCK_INVOICES = [
  { id: '1', number: 'INV-045', client: 'Tech Solutions', amount: 10000, date: 'Feb 15, 2026', overdue: 5, status: 'overdue' },
  { id: '2', number: 'INV-042', client: 'Global Services', amount: 15000, date: 'Jan 30, 2026', overdue: 11, status: 'overdue' },
  { id: '3', number: 'INV-048', client: 'Alpha Corp', amount: 5000, date: 'Feb 20, 2026', overdue: 0, status: 'pending' },
];

export function SendReminderPage({ isOpen, onClose }: SendReminderPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInvoices, setSelectedInvoices] = useState<any[]>([]);
  const [showInvoiceList, setShowInvoiceList] = useState(true);
  const [templateId, setTemplateId] = useState('friendly');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [sendViaEmail, setSendViaEmail] = useState(true);
  const [sendViaSMS, setSendViaSMS] = useState(false);
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [attachPDF, setAttachPDF] = useState(true);
  const [ccMe, setCcMe] = useState(false);
  const [logActivity, setLogActivity] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const content = TEMPLATE_CONTENT[templateId];
    if (content) {
      setSubject(content.subject);
      setMessage(content.body);
    }
  }, [templateId]);

  useEffect(() => {
    if (selectedInvoices.length > 0) {
      const maxOverdue = Math.max(...selectedInvoices.map((i) => i.overdue || 0));
      if (maxOverdue > 30) setTemplateId('final');
      else if (maxOverdue > 15) setTemplateId('urgent');
      else if (maxOverdue > 7) setTemplateId('overdue');
      else if (maxOverdue > 0) setTemplateId('friendly');
      else setTemplateId('gentle');
    }
  }, [selectedInvoices]);

  const toggleInvoice = (invoice: any) => {
    if (selectedInvoices.find((i) => i.id === invoice.id)) {
      setSelectedInvoices(selectedInvoices.filter((i) => i.id !== invoice.id));
    } else {
      setSelectedInvoices([...selectedInvoices, invoice]);
    }
  };

  const getPreviewText = (text: string) => {
    return text
      .replace(/{client_name}/g, selectedInvoices[0]?.client || 'Client Name')
      .replace(/{invoice_number}/g, selectedInvoices.map((i) => i.number).join(', ') || 'INV-XXX')
      .replace(/{amount}/g, selectedInvoices.length === 1 ? formatINR(selectedInvoices[0]?.amount || 0) : 'Total Amount')
      .replace(/{due_date}/g, selectedInvoices[0]?.date || 'Date')
      .replace(/{days_overdue}/g, String(selectedInvoices[0]?.overdue || 0))
      .replace(/{payment_link}/g, 'trustopay.link/pay/xxx')
      .replace(/{your_name}/g, 'Arjun Mehta');
  };

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep(2);
    }, 2000);
  };

  const canSend = selectedInvoices.length > 0 && (sendViaEmail || sendViaSMS);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        {step === 2 ? (
          <View style={styles.successScreen}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={48} color={colors.green600} />
            </View>
            <Text style={styles.successTitle}>Reminders Sent!</Text>
            <Text style={styles.successSub}>
              Sent to {selectedInvoices.length} client{selectedInvoices.length !== 1 ? 's' : ''} via{' '}
              {sendViaEmail ? 'Email' : ''}
              {sendViaSMS ? (sendViaEmail ? ' & SMS' : 'SMS') : ''}.
            </Text>
            <View style={styles.successActions}>
              <Button onPress={onClose} style={styles.successBtn}>
                Done
              </Button>
              <Button variant="outline" onPress={() => setStep(1)} style={styles.successBtn}>
                Send Another
              </Button>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Send Reminder</Text>
              <TouchableOpacity
                onPress={handleSend}
                disabled={!canSend || isSending}
                style={[styles.sendHeaderBtn, (!canSend || isSending) && styles.sendHeaderBtnDisabled]}
              >
                {isSending ? (
                  <Ionicons name="sync" size={16} color={colors.white} />
                ) : (
                  <Text style={styles.sendHeaderBtnText}>Send</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>SELECT INVOICES</Text>
                  <TouchableOpacity onPress={() => setShowInvoiceList(!showInvoiceList)}>
                    <Text style={styles.sectionLink}>{showInvoiceList ? 'Hide List' : 'Change Selection'}</Text>
                  </TouchableOpacity>
                </View>

                {showInvoiceList ? (
                  MOCK_INVOICES.map((inv) => {
                    const isSelected = !!selectedInvoices.find((i) => i.id === inv.id);
                    return (
                      <TouchableOpacity
                        key={inv.id}
                        style={[styles.invoiceCard, isSelected && styles.invoiceCardSelected]}
                        onPress={() => toggleInvoice(inv)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Ionicons name="checkmark" size={12} color={colors.white} />}
                        </View>
                        <View style={styles.invoiceBody}>
                          <View style={styles.invoiceRow}>
                            <Text style={styles.invoiceMain}>
                              {inv.number} • {inv.client}
                            </Text>
                            <Text style={styles.invoiceAmount}>{formatINR(inv.amount)}</Text>
                          </View>
                          <View style={styles.invoiceRow}>
                            <Text style={styles.invoiceSub}>Due: {inv.date}</Text>
                            {inv.overdue > 0 && (
                              <Text style={styles.invoiceOverdue}>{inv.overdue} days overdue</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.selectedSummary}>
                    <Text style={styles.selectedText}>{selectedInvoices.length} invoices selected</Text>
                    <Text style={styles.selectedTotal}>
                      Total: {formatINR(selectedInvoices.reduce((sum, i) => sum + i.amount, 0))}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CHOOSE REMINDER TYPE</Text>
                <SelectInput
                  label=""
                  value={templateId}
                  onValueChange={setTemplateId}
                  options={TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
                  placeholder="Select template"
                />
                <Text style={styles.templateDesc}>{TEMPLATES.find((t) => t.id === templateId)?.desc}</Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>MESSAGE PREVIEW</Text>
                  <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Text style={styles.sectionLink}>{isEditing ? 'Done Editing' : 'Edit Message'}</Text>
                  </TouchableOpacity>
                </View>
                <Input
                  label="Subject"
                  value={isEditing ? subject : getPreviewText(subject)}
                  onChangeText={setSubject}
                  placeholder="Subject"
                  editable={isEditing}
                  style={!isEditing ? { backgroundColor: colors.gray50, color: colors.gray600 } : undefined}
                />
                <View style={styles.textareaWrapper}>
                  <Text style={styles.textareaLabel}>Message</Text>
                  <TextInput
                    value={isEditing ? message : getPreviewText(message)}
                    onChangeText={setMessage}
                    editable={isEditing}
                    placeholder="Message"
                    placeholderTextColor={colors.gray400}
                    style={[styles.textarea, !isEditing && styles.textareaReadonly]}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SEND VIA</Text>
                <TouchableOpacity
                  style={styles.deliveryCard}
                  onPress={() => setSendViaEmail(!sendViaEmail)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deliveryLeft}>
                    <View style={[styles.deliveryIcon, styles.deliveryIconBlue]}>
                      <Ionicons name="mail-outline" size={18} color={colors.blue600} />
                    </View>
                    <View>
                      <Text style={styles.deliveryTitle}>Email</Text>
                      <Text style={styles.deliverySub}>Free • Professional format</Text>
                    </View>
                  </View>
                  <View style={[styles.checkbox, sendViaEmail && styles.checkboxChecked]}>
                    {sendViaEmail && <Ionicons name="checkmark" size={12} color={colors.white} />}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deliveryCard}
                  onPress={() => setSendViaSMS(!sendViaSMS)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deliveryLeft}>
                    <View style={[styles.deliveryIcon, styles.deliveryIconGreen]}>
                      <Ionicons name="call-outline" size={18} color={colors.green600} />
                    </View>
                    <View>
                      <Text style={styles.deliveryTitle}>SMS</Text>
                      <Text style={styles.deliverySub}>10 credits remaining</Text>
                    </View>
                  </View>
                  <View style={[styles.checkbox, sendViaSMS && styles.checkboxChecked]}>
                    {sendViaSMS && <Ionicons name="checkmark" size={12} color={colors.white} />}
                  </View>
                </TouchableOpacity>
                <View style={[styles.deliveryCard, styles.deliveryCardDisabled]}>
                  <View style={styles.deliveryLeft}>
                    <View style={[styles.deliveryIcon, styles.deliveryIconWhatsApp]}>
                      <Ionicons name="logo-whatsapp" size={18} color={colors.green600} />
                    </View>
                    <View>
                      <Text style={styles.deliveryTitle}>WhatsApp</Text>
                      <Text style={styles.deliverySub}>Coming Soon</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>WHEN TO SEND</Text>
                <View style={styles.scheduleRow}>
                  <TouchableOpacity
                    style={[styles.scheduleBtn, scheduleType === 'now' && styles.scheduleBtnActive]}
                    onPress={() => setScheduleType('now')}
                  >
                    <Text style={[styles.scheduleBtnText, scheduleType === 'now' && styles.scheduleBtnTextActive]}>
                      Send Now
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.scheduleBtn, scheduleType === 'later' && styles.scheduleBtnActive]}
                    onPress={() => setScheduleType('later')}
                  >
                    <Text style={[styles.scheduleBtnText, scheduleType === 'later' && styles.scheduleBtnTextActive]}>
                      Schedule for Later
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.advancedHeader}
                onPress={() => setShowAdvanced(!showAdvanced)}
              >
                <Text style={styles.advancedHeaderText}>Advanced Options</Text>
                <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={18} color={colors.gray500} />
              </TouchableOpacity>
              {showAdvanced && (
                <View style={styles.advancedContent}>
                  <View style={styles.toggleRow}>
                    <View>
                      <Text style={styles.toggleLabel}>Attach Invoice PDF</Text>
                      <Text style={styles.toggleSub}>Include PDF in email</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.switch, attachPDF && styles.switchOn]}
                      onPress={() => setAttachPDF(!attachPDF)}
                    >
                      <View style={[styles.switchKnob, attachPDF && styles.switchKnobOn]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.toggleRow}>
                    <View>
                      <Text style={styles.toggleLabel}>CC Yourself</Text>
                      <Text style={styles.toggleSub}>Send copy to your email</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.switch, ccMe && styles.switchOn]}
                      onPress={() => setCcMe(!ccMe)}
                    >
                      <View style={[styles.switchKnob, ccMe && styles.switchKnobOn]} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.toggleRow}>
                    <View>
                      <Text style={styles.toggleLabel}>Log Activity</Text>
                      <Text style={styles.toggleSub}>Add to invoice timeline</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.switch, logActivity && styles.switchOn]}
                      onPress={() => setLogActivity(!logActivity)}
                    >
                      <View style={[styles.switchKnob, logActivity && styles.switchKnobOn]} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footer}>
              <Button variant="outline" style={styles.footerPreview} onPress={() => setShowPreview(true)}>
                Preview Email
              </Button>
              <Button
                style={styles.footerSend}
                onPress={handleSend}
                disabled={!canSend || isSending}
              >
                {isSending ? (
                  <View style={styles.sendingContent}>
                    <Ionicons name="sync" size={18} color={colors.white} style={{ marginRight: 8 }} />
                    <Text style={styles.footerSendText}>Sending...</Text>
                  </View>
                ) : (
                  <Text style={styles.footerSendText}>
                    Send Reminder{selectedInvoices.length > 1 ? `s (${selectedInvoices.length})` : ''}
                  </Text>
                )}
              </Button>
            </View>
          </>
        )}
      </View>

      {showPreview && (
        <Modal visible transparent animationType="slide">
          <View style={styles.previewModal}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Email Preview</Text>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Ionicons name="close-outline" size={24} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.previewScroll}>
              <View style={styles.previewCard}>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewMetaText}>
                    From: Arjun Mehta &lt;arjun@trustopay.com&gt;
                  </Text>
                  <Text style={styles.previewMetaText}>
                    To: {selectedInvoices[0]?.client || 'Client Name'}
                  </Text>
                  <Text style={styles.previewMetaText}>Subject: {getPreviewText(subject)}</Text>
                </View>
                <Text style={styles.previewBody}>{getPreviewText(message)}</Text>
                <View style={styles.previewInvoiceBox}>
                  <Text style={styles.previewInvoiceLabel}>Invoice Details</Text>
                  <View style={styles.previewInvoiceRow}>
                    <Text style={styles.previewInvoiceKey}>Amount Due:</Text>
                    <Text style={styles.previewInvoiceVal}>
                      {formatINR(selectedInvoices[0]?.amount || 0)}
                    </Text>
                  </View>
                  <View style={styles.previewInvoiceRow}>
                    <Text style={styles.previewInvoiceKey}>Due Date:</Text>
                    <Text style={styles.previewInvoiceVal}>{selectedInvoices[0]?.date || 'Date'}</Text>
                  </View>
                </View>
                <View style={styles.previewBtnWrap}>
                  <Text style={styles.previewBtnText}>View & Pay Invoice</Text>
                </View>
              </View>
            </ScrollView>
            <View style={styles.previewFooter}>
              <Button variant="outline" style={styles.previewFooterBtn} onPress={() => setShowPreview(false)}>
                Close
              </Button>
              <Button
                style={styles.previewFooterBtn}
                onPress={() => {
                  setShowPreview(false);
                  handleSend();
                }}
              >
                Send Now
              </Button>
            </View>
          </View>
        </Modal>
      )}
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
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  sendHeaderBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  sendHeaderBtnDisabled: { opacity: 0.5 },
  sendHeaderBtnText: { fontSize: 14, fontWeight: '700', color: colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1 },
  sectionLink: { fontSize: 12, fontWeight: '600', color: colors.purple },
  invoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  invoiceCardSelected: { borderColor: colors.purple, backgroundColor: colors.purple50 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: colors.purple, borderColor: colors.purple },
  invoiceBody: { flex: 1 },
  invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  invoiceMain: { fontSize: 14, fontWeight: '700', color: colors.navy },
  invoiceAmount: { fontSize: 14, fontWeight: '700', color: colors.navy },
  invoiceSub: { fontSize: 12, color: colors.gray500 },
  invoiceOverdue: { fontSize: 12, fontWeight: '600', color: colors.red500 },
  selectedSummary: {
    padding: 12,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedText: { fontSize: 14, fontWeight: '500', color: colors.gray700 },
  selectedTotal: { fontSize: 12, color: colors.gray500 },
  templateDesc: { fontSize: 12, color: colors.gray500, marginTop: 8 },
  textareaWrapper: { marginTop: 12 },
  textareaLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 6 },
  textarea: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  textareaReadonly: { backgroundColor: colors.gray50, color: colors.gray600 },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  deliveryCardDisabled: { backgroundColor: colors.gray50, opacity: 0.7 },
  deliveryLeft: { flexDirection: 'row', alignItems: 'center' },
  deliveryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deliveryIconBlue: { backgroundColor: colors.blue100 },
  deliveryIconGreen: { backgroundColor: colors.green100 },
  deliveryIconWhatsApp: { backgroundColor: colors.green100 },
  deliveryTitle: { fontSize: 14, fontWeight: '600', color: colors.navy },
  deliverySub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  scheduleRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  scheduleBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  scheduleBtnActive: { backgroundColor: colors.purple },
  scheduleBtnText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  scheduleBtnTextActive: { fontSize: 14, fontWeight: '600', color: colors.white },
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  advancedHeaderText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  advancedContent: { marginTop: 8, padding: 16, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: colors.navy },
  toggleSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray200,
    padding: 2,
    justifyContent: 'center',
  },
  switchOn: { backgroundColor: colors.purple },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
  },
  switchKnobOn: { alignSelf: 'flex-end' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: 12,
  },
  footerPreview: { flex: 1 },
  footerSend: { flex: 2 },
  footerSendText: { fontSize: 16, fontWeight: '700', color: colors.white },
  sendingContent: { flexDirection: 'row', alignItems: 'center' },
  successScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.white,
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
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: 14, color: colors.gray500, textAlign: 'center', marginBottom: 32 },
  successActions: { width: '100%', gap: 12 },
  successBtn: { width: '100%', marginBottom: 12 },
  previewModal: { flex: 1, backgroundColor: colors.white },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  previewTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  previewScroll: { flex: 1, backgroundColor: colors.gray50, padding: 16 },
  previewCard: { backgroundColor: colors.white, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: colors.gray200 },
  previewMeta: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  previewMetaText: { fontSize: 12, color: colors.gray600, marginBottom: 4 },
  previewBody: { fontSize: 14, color: colors.gray700, lineHeight: 22, marginBottom: 16 },
  previewInvoiceBox: { backgroundColor: colors.gray50, padding: 12, borderRadius: 8, marginBottom: 16 },
  previewInvoiceLabel: { fontSize: 11, fontWeight: '700', color: colors.gray400, marginBottom: 8 },
  previewInvoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  previewInvoiceKey: { fontSize: 13, color: colors.gray600 },
  previewInvoiceVal: { fontSize: 13, fontWeight: '600', color: colors.navy },
  previewBtnWrap: { alignItems: 'center', marginBottom: 16 },
  previewBtnText: { fontSize: 14, fontWeight: '700', color: colors.purple },
  previewFooter: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  previewFooterBtn: { flex: 1 },
});
