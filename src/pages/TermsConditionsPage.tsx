import React, { useState } from 'react';
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
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/SelectInput';
import { colors } from '../theme/colors';

interface Term {
  id: string;
  title: string;
  content: string;
  category?: string;
  isDefault?: boolean;
  isCustom?: boolean;
}

interface TermsConditionsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const PREMADE_TEMPLATES: Term[] = [
  {
    id: 't1',
    title: 'Standard Payment Terms',
    content: `PAYMENT TERMS

Payment is due within 30 days of the invoice date. Accepted payment methods include bank transfer, UPI, credit/debit card, and cheque.

Invoice Date: [Date will be auto-filled]
Due Date: [30 days from invoice date]

For bank transfers, please use the account details provided on this invoice.

Late payments may be subject to interest charges as per our late payment policy.

For any payment-related queries, please contact us at [Your Contact].`,
    category: 'Payment',
    isCustom: false,
  },
  {
    id: 't2',
    title: 'Late Payment Policy',
    content: `LATE PAYMENT POLICY

Interest on Overdue Payments:
Any payment not received by the due date will incur an interest charge of 2% per month (24% per annum) on the outstanding amount.

Grace Period:
A grace period of 3 business days is provided after the due date before interest charges apply.`,
    category: 'Policy',
    isCustom: false,
  },
  {
    id: 't3',
    title: 'Net 15 Terms',
    content: `PAYMENT TERMS (NET 15)

Payment is due within 15 days of the invoice date.

Quick Payment Benefit:
To maintain our fast turnaround times, we require payment within 15 days.`,
    category: 'Payment',
    isCustom: false,
  },
  {
    id: 't4',
    title: 'Net 60 Terms',
    content: `PAYMENT TERMS (NET 60)

Payment is due within 60 days of the invoice date. Extended payment terms to support your cash flow.`,
    category: 'Payment',
    isCustom: false,
  },
  {
    id: 't5',
    title: 'Advance Payment Required',
    content: `ADVANCE PAYMENT TERMS

50% Advance Payment required before commencement of work. Balance due on completion.`,
    category: 'Payment',
    isCustom: false,
  },
  {
    id: 't6',
    title: 'Milestone Payment Terms',
    content: `MILESTONE-BASED PAYMENT

Payments released upon successful completion of each project milestone.`,
    category: 'Payment',
    isCustom: false,
  },
  {
    id: 't7',
    title: 'Project Delivery Terms',
    content: `DELIVERY & PAYMENT TERMS

Final deliverables released only upon receipt of full payment.`,
    category: 'Delivery',
    isCustom: false,
  },
  {
    id: 't8',
    title: 'No Refund Policy',
    content: `REFUND POLICY

All payments for services rendered are final and non-refundable.`,
    category: 'Policy',
    isCustom: false,
  },
  {
    id: 't9',
    title: 'Service Warranty',
    content: `SERVICE WARRANTY

30-Day warranty on all services. Bugs or errors in deliverables covered.`,
    category: 'Warranty',
    isCustom: false,
  },
  {
    id: 't10',
    title: 'Cancellation Policy',
    content: `CANCELLATION POLICY

Minimum 48 hours notice required. Cancellation charges may apply.`,
    category: 'Policy',
    isCustom: false,
  },
];

const CATEGORY_OPTIONS = [
  { value: 'Payment Terms', label: 'Payment Terms' },
  { value: 'Late Payment Policy', label: 'Late Payment Policy' },
  { value: 'Delivery Terms', label: 'Delivery Terms' },
  { value: 'Cancellation Policy', label: 'Cancellation Policy' },
  { value: 'Warranty Terms', label: 'Warranty Terms' },
  { value: 'Refund Policy', label: 'Refund Policy' },
  { value: 'Service Terms', label: 'Service Terms' },
  { value: 'Other', label: 'Other' },
];

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max).trim() + '...';
}

export function TermsConditionsPage({ isOpen, onClose }: TermsConditionsPageProps) {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [customTerms, setCustomTerms] = useState<Term[]>([]);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [previewTerm, setPreviewTerm] = useState<Term | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Payment Terms');
  const [formContent, setFormContent] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleCreateNew = () => {
    setEditingTerm(null);
    setFormTitle('');
    setFormCategory('Payment Terms');
    setFormContent('');
    setFormIsDefault(false);
    setFormErrors({});
    setView('create');
  };

  const handleEdit = (term: Term) => {
    setEditingTerm(term);
    setFormTitle(term.title);
    setFormCategory(term.category || 'Payment Terms');
    setFormContent(term.content);
    setFormIsDefault(term.isDefault || false);
    setFormErrors({});
    setView('edit');
  };

  const handleDuplicate = (term: Term) => {
    const newTerm: Term = {
      ...term,
      id: Date.now().toString(),
      title: `${term.title} (Copy)`,
      isCustom: true,
      isDefault: false,
    };
    setCustomTerms([...customTerms, newTerm]);
    showSuccessToast('Term duplicated successfully! ✓');
  };

  const handleDelete = (id: string) => {
    setCustomTerms(customTerms.filter((t) => t.id !== id));
    setDeleteConfirmId(null);
    showSuccessToast('Term deleted');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim() || formTitle.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!formContent.trim() || formContent.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setIsSaving(true);
    setTimeout(() => {
      const newTerm: Term = {
        id: editingTerm ? editingTerm.id : Date.now().toString(),
        title: formTitle,
        content: formContent,
        category: formCategory,
        isDefault: formIsDefault,
        isCustom: true,
      };
      if (editingTerm) {
        setCustomTerms(customTerms.map((t) => (t.id === editingTerm.id ? newTerm : t)));
        showSuccessToast('Term updated! ✓');
      } else {
        setCustomTerms([...customTerms, newTerm]);
        showSuccessToast('Term created successfully! ✓');
      }
      setIsSaving(false);
      setView('list');
    }, 1000);
  };

  const showSuccessToast = (message: string) => {
    setShowToast({ type: 'success', message });
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleUseTemplate = (template: Term) => {
    const newTerm: Term = {
      ...template,
      id: Date.now().toString(),
      title: template.title,
      isCustom: true,
      isDefault: false,
    };
    setCustomTerms([...customTerms, newTerm]);
    showSuccessToast('Template added to your terms! ✓');
  };

  const handleCustomizeTemplate = (template: Term) => {
    setEditingTerm(null);
    setFormTitle(template.title);
    setFormCategory(template.category || 'Payment Terms');
    setFormContent(template.content);
    setFormIsDefault(false);
    setFormErrors({});
    setView('create');
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        {showToast && (
          <View
            style={[
              styles.toast,
              showToast.type === 'success' ? styles.toastSuccess : styles.toastError,
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.toastText}>{showToast.message}</Text>
          </View>
        )}

        {/* List View */}
        {view === 'list' && (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={handleCreateNew} style={styles.newTermBtn}>
                <Ionicons name="add-outline" size={18} color={colors.purple} />
                <Text style={styles.newTermBtnText}>New Term</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
              <Text style={styles.sectionTitle}>MY CUSTOM TERMS</Text>
              <Text style={styles.sectionSub}>Terms you've created or customized</Text>

              {customTerms.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyEmoji}>📝</Text>
                  </View>
                  <Text style={styles.emptyTitle}>No custom terms yet</Text>
                  <Text style={styles.emptySub}>
                    Create your own terms or customize a pre-made template to get started
                  </Text>
                  <Button variant="outline" size="sm" onPress={handleCreateNew}>
                    + Create New Term
                  </Button>
                </View>
              ) : (
                customTerms.map((term) => (
                  <Card key={term.id} style={styles.termCard}>
                    <View style={styles.termCardHeader}>
                      <Text style={styles.termCardTitle} numberOfLines={1}>
                        {term.title}
                      </Text>
                      {term.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.termCardPreview} numberOfLines={2}>
                      {term.content}
                    </Text>
                    {deleteConfirmId === term.id ? (
                      <View style={styles.deleteConfirm}>
                        <Text style={styles.deleteConfirmText}>Delete this term?</Text>
                        <View style={styles.deleteConfirmActions}>
                          <TouchableOpacity onPress={() => setDeleteConfirmId(null)}>
                            <Text style={styles.deleteCancel}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(term.id)} style={styles.deleteBtn}>
                            <Text style={styles.deleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.termActions}>
                        <TouchableOpacity style={styles.termAction} onPress={() => handleEdit(term)}>
                          <Ionicons name="create-outline" size={14} color={colors.purple} />
                          <Text style={styles.termActionTextPurple}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.termAction} onPress={() => handleDuplicate(term)}>
                          <Ionicons name="copy-outline" size={14} color={colors.gray600} />
                          <Text style={styles.termActionTextGray}>Duplicate</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.termAction} onPress={() => setDeleteConfirmId(term.id)}>
                          <Ionicons name="trash-outline" size={14} color={colors.red500} />
                          <Text style={styles.termActionTextRed}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Card>
                ))
              )}

              <Text style={[styles.sectionTitle, { marginTop: 32 }]}>PRE-MADE TEMPLATES</Text>
              <Text style={styles.sectionSub}>Ready to use - click to customize</Text>

              {PREMADE_TEMPLATES.map((template) => (
                <Card key={template.id} style={styles.templateCard}>
                  <View style={styles.templateHeader}>
                    <View style={styles.templateIcon}>
                      <Ionicons name="document-text-outline" size={18} color={colors.gray400} />
                    </View>
                    <View style={styles.templateBody}>
                      <Text style={styles.templateTitle}>{template.title}</Text>
                      <Text style={styles.templatePreview} numberOfLines={2}>
                        {truncate(template.content.replace(/\n/g, ' '), 80)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.templateActions}>
                    <TouchableOpacity
                      style={styles.templateBtnOutline}
                      onPress={() => setPreviewTerm(template)}
                    >
                      <Text style={styles.templateBtnOutlineText}>Preview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.templateBtnPrimary}
                      onPress={() => handleUseTemplate(template)}
                    >
                      <Text style={styles.templateBtnPrimaryText}>Use This</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.templateBtnOutline}
                      onPress={() => handleCustomizeTemplate(template)}
                    >
                      <Text style={styles.templateBtnPurpleText}>Customize</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
              <View style={{ height: 120 }} />
            </ScrollView>
          </>
        )}

        {/* Create/Edit View */}
        {(view === 'create' || view === 'edit') && (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{view === 'create' ? 'Create Term' : 'Edit Term'}</Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                style={styles.saveHeaderBtn}
              >
                <Text style={[styles.saveHeaderBtnText, isSaving && styles.saveHeaderBtnDisabled]}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.formContent}>
              <Input
                label="Term Name *"
                placeholder="e.g., My Late Payment Policy"
                value={formTitle}
                onChangeText={setFormTitle}
              />
              {formErrors.title ? (
                <Text style={styles.errorText}>{formErrors.title}</Text>
              ) : null}

              <SelectInput
                label="Category"
                value={formCategory}
                onValueChange={setFormCategory}
                options={CATEGORY_OPTIONS}
              />

              <View style={styles.textareaWrapper}>
                <Text style={styles.textareaLabel}>Term Content *</Text>
                <TextInput
                  value={formContent}
                  onChangeText={(v) => setFormContent(v.slice(0, 2000))}
                  placeholder="Enter your terms and conditions here..."
                  placeholderTextColor={colors.gray400}
                  style={[styles.textarea, formErrors.content && styles.textareaError]}
                  multiline
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{formContent.length} / 2000</Text>
                {formErrors.content ? (
                  <Text style={styles.errorText}>{formErrors.content}</Text>
                ) : null}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
                  {['{invoice_number}', '{due_date}', '{amount}'].map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tagBtn}
                      onPress={() => setFormContent((prev) => prev + ' ' + tag)}
                    >
                      <Text style={styles.tagBtnText}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Card style={styles.defaultToggleCard}>
                <View>
                  <Text style={styles.defaultToggleLabel}>Apply to new invoices</Text>
                  <Text style={styles.defaultToggleSub}>Auto-add to all new invoices</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switch, formIsDefault && styles.switchOn]}
                  onPress={() => setFormIsDefault(!formIsDefault)}
                >
                  <View style={[styles.switchKnob, formIsDefault && styles.switchKnobOn]} />
                </TouchableOpacity>
              </Card>

              <Text style={styles.previewLabel}>PREVIEW</Text>
              <View style={styles.previewBox}>
                <Text style={styles.previewTitle}>{formTitle || 'Term Title'}</Text>
                <Text style={styles.previewContent}>{formContent || 'Term content will appear here...'}</Text>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </View>

      {/* Preview Modal */}
      {previewTerm && (
        <Modal visible transparent animationType="slide">
          <View style={styles.previewModal}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.previewModalTitle} numberOfLines={1}>
                {previewTerm.title}
              </Text>
              <TouchableOpacity onPress={() => setPreviewTerm(null)}>
                <Ionicons name="close-outline" size={24} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.previewModalScroll}>
              <View style={styles.previewModalContent}>
                <Text style={styles.previewModalContentTitle}>{previewTerm.title}</Text>
                <Text style={styles.previewModalContentText}>{previewTerm.content}</Text>
              </View>
            </ScrollView>
            <View style={styles.previewModalFooter}>
              <Button
                variant="outline"
                style={styles.previewModalBtn}
                onPress={() => {
                  handleCustomizeTemplate(previewTerm);
                  setPreviewTerm(null);
                }}
              >
                Customize
              </Button>
              <Button
                style={styles.previewModalBtn}
                onPress={() => {
                  handleUseTemplate(previewTerm);
                  setPreviewTerm(null);
                }}
              >
                Use This
              </Button>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  toast: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 60 : 100,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastSuccess: { backgroundColor: colors.green600 },
  toastError: { backgroundColor: colors.red500 },
  toastText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 8 },
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
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  newTermBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newTermBtnText: { fontSize: 14, fontWeight: '700', color: colors.purple, marginLeft: 4 },
  saveHeaderBtn: { paddingVertical: 8 },
  saveHeaderBtnText: { fontSize: 14, fontWeight: '700', color: colors.purple },
  saveHeaderBtnDisabled: { opacity: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  formContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1, marginBottom: 4 },
  sectionSub: { fontSize: 10, color: colors.gray400, marginBottom: 12 },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyEmoji: { fontSize: 24 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  emptySub: { fontSize: 12, color: colors.gray500, textAlign: 'center', marginBottom: 16 },
  termCard: { marginBottom: 12 },
  termCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  termCardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.navy },
  defaultBadge: { backgroundColor: colors.purple100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: colors.purple },
  termCardPreview: { fontSize: 12, color: colors.gray500, marginBottom: 12 },
  deleteConfirm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.red50,
    padding: 12,
    borderRadius: 8,
  },
  deleteConfirmText: { fontSize: 12, fontWeight: '700', color: colors.red500 },
  deleteConfirmActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteCancel: { fontSize: 12, fontWeight: '500', color: colors.gray600 },
  deleteBtn: { backgroundColor: colors.red500, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: colors.white },
  termActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: 12,
  },
  termAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  termActionTextPurple: { fontSize: 12, fontWeight: '500', color: colors.purple },
  termActionTextGray: { fontSize: 12, fontWeight: '500', color: colors.gray600 },
  termActionTextRed: { fontSize: 12, fontWeight: '500', color: colors.red500 },
  templateCard: { marginBottom: 12 },
  templateHeader: { flexDirection: 'row', marginBottom: 12 },
  templateIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  templateBody: { flex: 1 },
  templateTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  templatePreview: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  templateActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 12, gap: 8 },
  templateBtnOutline: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  templateBtnOutlineText: { fontSize: 12, fontWeight: '500', color: colors.gray600 },
  templateBtnPurpleText: { fontSize: 12, fontWeight: '500', color: colors.purple },
  templateBtnPrimary: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.purple,
    alignItems: 'center',
  },
  templateBtnPrimaryText: { fontSize: 12, fontWeight: '700', color: colors.white },
  textareaWrapper: { marginBottom: 16 },
  textareaLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 6 },
  textarea: {
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  textareaError: { borderColor: colors.red500 },
  charCount: { fontSize: 10, color: colors.gray400, marginTop: 4, textAlign: 'right' },
  errorText: { fontSize: 12, color: colors.red500, marginTop: 4 },
  tagRow: { marginTop: 8, marginBottom: 8 },
  tagBtn: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  tagBtnText: { fontSize: 10, color: colors.gray600 },
  defaultToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  defaultToggleLabel: { fontSize: 14, fontWeight: '500', color: colors.navy },
  defaultToggleSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
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
  previewLabel: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1, marginBottom: 12 },
  previewBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 16,
  },
  previewTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 8, textTransform: 'uppercase' },
  previewContent: { fontSize: 12, color: colors.gray600, lineHeight: 20 },
  previewModal: { flex: 1, backgroundColor: colors.white },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  previewModalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy, marginRight: 8 },
  previewModalScroll: { flex: 1, backgroundColor: colors.gray50 },
  previewModalContent: {
    margin: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 24,
    minHeight: 200,
  },
  previewModalContentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 16,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    paddingBottom: 8,
  },
  previewModalContentText: { fontSize: 14, color: colors.gray700, lineHeight: 22 },
  previewModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
    gap: 12,
  },
  previewModalBtn: { flex: 1 },
});
