import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/SelectInput';
import { colors } from '../theme/colors';
import { api } from '../services/api';

type FormatComponentType =
  | 'prefix'
  | 'year'
  | 'year_short'
  | 'month'
  | 'month_name'
  | 'day'
  | 'fy'
  | 'separator'
  | 'number'
  | 'suffix';

interface FormatComponent {
  id: string;
  type: FormatComponentType;
  value?: string;
  label: string;
}

interface InvoiceSettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  { value: 'seq', label: 'Sequential (INV-001, INV-002...)' },
  { value: 'year-seq', label: 'Year + Sequential (INV-2026-001...)' },
  { value: 'month-year-seq', label: 'Month-Year + Sequential (INV-FEB26-001...)' },
  { value: 'fy-seq', label: 'Financial Year + Sequential (INV-FY26-001...)' },
  { value: 'date-seq', label: 'Date + Sequential (INV-20260210-001...)' },
];

const RESET_OPTIONS = [
  { value: 'never', label: 'Never (Continuous numbering)' },
  { value: 'fy', label: 'Every Financial Year (April 1)' },
  { value: 'year', label: 'Every Calendar Year (January 1)' },
  { value: 'month', label: 'Every Month' },
];

const PADDING_OPTIONS = [
  { value: '2', label: '2 digits (01)' },
  { value: '3', label: '3 digits (001)' },
  { value: '4', label: '4 digits (0001)' },
  { value: '5', label: '5 digits (00001)' },
];

const CUSTOM_COMPONENT_OPTIONS: { type: FormatComponentType; label: string; defaultValue?: string }[] = [
  { type: 'prefix', label: 'Prefix Text', defaultValue: 'INV' },
  { type: 'separator', label: 'Separator', defaultValue: '-' },
  { type: 'year', label: 'Year (YYYY)' },
  { type: 'year_short', label: 'Year Short (YY)' },
  { type: 'month_name', label: 'Month (MMM)' },
  { type: 'fy', label: 'Financial Year' },
  { type: 'number', label: 'Number (required)' },
];

export function InvoiceSettingsPage({ isOpen, onClose }: InvoiceSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'invoices' | 'quotes'>('invoices');
  const [formatType, setFormatType] = useState<'preset' | 'custom'>('preset');
  const [selectedTemplate, setSelectedTemplate] = useState('year-seq');
  const [startingNumber, setStartingNumber] = useState('001');
  const [resetOption, setResetOption] = useState('never');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'warning'; message: string } | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<'error' | 'auto'>('error');
  const [manualOverride, setManualOverride] = useState(false);
  const [padding, setPadding] = useState(3);
  const [skipDeleted, setSkipDeleted] = useState(true);
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [customComponents, setCustomComponents] = useState<FormatComponent[]>([
    { id: '1', type: 'prefix', value: 'INV', label: 'Prefix' },
    { id: '2', type: 'separator', value: '-', label: 'Separator' },
    { id: '3', type: 'year', label: 'Year (YYYY)' },
    { id: '4', type: 'separator', value: '-', label: 'Separator' },
    { id: '5', type: 'number', label: 'Number' },
  ]);

  const generatePreview = (offset = 0) => {
    const num = Math.max(1, parseInt(startingNumber, 10) + offset);
    const paddedNum = num.toString().padStart(padding, '0');
    const date = new Date();
    const year = date.getFullYear();
    const yearShort = year.toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const monthName = date.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    const fyShort =
      date.getMonth() >= 3 ? `FY${parseInt(yearShort, 10) + 1}` : `FY${yearShort}`;
    const prefix = activeTab === 'invoices' ? 'INV' : 'QUO';

    if (formatType === 'preset') {
      switch (selectedTemplate) {
        case 'seq':
          return `${prefix}-${paddedNum}`;
        case 'year-seq':
          return `${prefix}-${year}-${paddedNum}`;
        case 'month-year-seq':
          return `${prefix}-${monthName}${yearShort}-${paddedNum}`;
        case 'fy-seq':
          return `${prefix}-${fyShort}-${paddedNum}`;
        case 'date-seq':
          return `${prefix}-${year}${month}${day}-${paddedNum}`;
        default:
          return `${prefix}-${paddedNum}`;
      }
    }

    return customComponents
      .map((c) => {
        switch (c.type) {
          case 'prefix':
            return c.value || '';
          case 'separator':
            return c.value || '';
          case 'year':
            return year.toString();
          case 'year_short':
            return yearShort;
          case 'month':
            return month;
          case 'month_name':
            return monthName;
          case 'day':
            return day;
          case 'fy':
            return fyShort;
          case 'number':
            return paddedNum;
          case 'suffix':
            return c.value || '';
          default:
            return '';
        }
      })
      .join('');
  };

  const loadSettings = useCallback(async (target: 'invoices' | 'quotes') => {
    try {
      const { data } = await api.get<{
        format_type?: string;
        selected_template?: string;
        starting_number?: string;
        reset_option?: string;
        padding?: number;
        duplicate_check?: string;
        manual_override?: boolean;
        skip_deleted?: boolean;
        custom_components?: FormatComponent[];
      } | null>(`/invoice-settings?target=${target}`);
      if (data) {
        setFormatType((data.format_type as 'preset' | 'custom') || 'preset');
        setSelectedTemplate(data.selected_template || 'year-seq');
        setStartingNumber(data.starting_number || '001');
        setResetOption(data.reset_option || 'never');
        setPadding(data.padding ?? 3);
        setDuplicateCheck((data.duplicate_check as 'error' | 'auto') || 'error');
        setManualOverride(data.manual_override ?? false);
        setSkipDeleted(data.skip_deleted ?? true);
        if (Array.isArray(data.custom_components) && data.custom_components.length > 0) {
          setCustomComponents(
            data.custom_components.map((c, i) => ({
              id: (c as FormatComponent).id || String(i),
              type: (c as FormatComponent).type,
              value: (c as FormatComponent).value,
              label: (c as FormatComponent).label,
            }))
          );
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      loadSettings(activeTab).finally(() => setLoading(false));
    }
  }, [isOpen, activeTab, loadSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setShowToast(null);
    try {
      const payload = {
        target: activeTab,
        format_type: formatType,
        selected_template: selectedTemplate,
        starting_number: startingNumber,
        reset_option: resetOption,
        padding,
        duplicate_check: duplicateCheck,
        manual_override: manualOverride,
        skip_deleted: skipDeleted,
        custom_components: formatType === 'custom' ? customComponents : [],
      };
      await api.post('/invoice-settings', payload);
      setShowToast({ type: 'success', message: 'Invoice settings saved! ✓' });
      setTimeout(() => {
        setShowToast(null);
        onClose();
      }, 2000);
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setShowToast({ type: 'warning', message: msg || 'Failed to save settings' });
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addCustomComponent = (
    type: FormatComponentType,
    label: string,
    defaultValue?: string,
  ) => {
    setCustomComponents((prev) => [
      ...prev,
      { id: Date.now().toString(), type, label, value: defaultValue },
    ]);
    setShowComponentPicker(false);
  };

  const removeCustomComponent = (id: string) => {
    setCustomComponents((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCustomComponent = (id: string, value: string) => {
    setCustomComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c)),
    );
  };

  const handleStartingNumberChange = (v: string) => {
    const num = v.replace(/\D/g, '');
    setStartingNumber(num || '001');
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Toast */}
        {showToast && (
          <View
            style={[
              styles.toast,
              showToast.type === 'success' ? styles.toastSuccess : styles.toastWarning,
            ]}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.toastText}>{showToast.message}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.title}>Invoice Settings</Text>
        </View>

        {/* Tabs */}
        {loading && (
          <View style={styles.loadingBar}>
            <ActivityIndicator size="small" color={colors.purple} />
            <Text style={styles.loadingText}>Loading settings...</Text>
          </View>
        )}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invoices' && styles.tabActive]}
            onPress={() => setActiveTab('invoices')}
          >
            <Text style={[styles.tabText, activeTab === 'invoices' && styles.tabTextActive]}>
              Invoices
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quotes' && styles.tabActive]}
            onPress={() => setActiveTab('quotes')}
          >
            <Text style={[styles.tabText, activeTab === 'quotes' && styles.tabTextActive]}>
              Quotes
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Numbering Format */}
          <Text style={styles.sectionTitle}>NUMBERING FORMAT</Text>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setFormatType('preset')}
          >
            <View style={[styles.radio, formatType === 'preset' && styles.radioChecked]}>
              {formatType === 'preset' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Use Preset Template</Text>
          </TouchableOpacity>

          {formatType === 'preset' && (
            <View style={styles.presetContent}>
              <SelectInput
                label=""
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                options={TEMPLATES}
                placeholder="Select template"
              />
              <Text style={styles.hint}>
                Example: {TEMPLATES.find((t) => t.value === selectedTemplate)?.label}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.radioRow} onPress={() => setFormatType('custom')}>
            <View style={[styles.radio, formatType === 'custom' && styles.radioChecked]}>
              {formatType === 'custom' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Custom Format</Text>
          </TouchableOpacity>

          {formatType === 'custom' && (
            <View style={styles.customContent}>
              <Card style={styles.customCard}>
                <View style={styles.customHeader}>
                  <Text style={styles.customSectionLabel}>Build Format</Text>
                  <TouchableOpacity
                    onPress={() => setShowComponentPicker(true)}
                    style={styles.addBtn}
                  >
                    <Ionicons name="add-outline" size={14} color={colors.purple} />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {customComponents.map((comp) => (
                  <View key={comp.id} style={styles.componentRow}>
                    <Ionicons name="reorder-four-outline" size={14} color={colors.gray400} />
                    <View style={styles.componentBody}>
                      <Text style={styles.componentLabel}>{comp.label}</Text>
                      {['prefix', 'separator', 'suffix'].includes(comp.type) && (
                        <TextInput
                          value={comp.value || ''}
                          onChangeText={(v) => updateCustomComponent(comp.id, v)}
                          style={styles.componentInput}
                          placeholder="Value"
                        />
                      )}
                    </View>
                    {comp.type !== 'number' && (
                      <TouchableOpacity onPress={() => removeCustomComponent(comp.id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.gray400} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </Card>
            </View>
          )}

          {/* Starting Number */}
          <Text style={styles.sectionTitle}>STARTING NUMBER</Text>
          <Card style={styles.card}>
            <Input
              label="Start Numbering From"
              value={startingNumber}
              onChangeText={handleStartingNumberChange}
              placeholder="001"
            />
            <Text style={styles.hint}>
              Your next {activeTab === 'invoices' ? 'invoice' : 'quote'} will be:{' '}
              <Text style={styles.previewHighlight}>{generatePreview()}</Text>
            </Text>
            <Text style={styles.italicHint}>
              Set this to continue from your last invoice number if migrating from another system
            </Text>
          </Card>

          {/* Auto-Reset */}
          <Text style={styles.sectionTitle}>AUTO-RESET</Text>
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Automatically reset numbering:</Text>
            {RESET_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioRow}
                onPress={() => setResetOption(opt.value)}
              >
                <View style={[styles.radio, resetOption === opt.value && styles.radioChecked]}>
                  {resetOption === opt.value && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.resetHint}>
              <Text style={styles.resetHintText}>
                {resetOption === 'never'
                  ? 'Numbering will continue indefinitely (e.g., 001, 002, 003...)'
                  : 'Numbering will reset to 001 at the start of each period.'}
              </Text>
            </View>
          </Card>

          {/* Preview */}
          <Text style={styles.sectionTitle}>PREVIEW</Text>
          <Card style={[styles.card, styles.previewCard]}>
            <Text style={styles.previewIntro}>Your invoices will be numbered as:</Text>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Current</Text>
              <Text style={styles.previewValue}>{generatePreview(-1)}</Text>
            </View>
            <View style={[styles.previewRow, styles.previewNext]}>
              <Text style={styles.previewNextLabel}>Next</Text>
              <Text style={styles.previewNextValue}>{generatePreview(0)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Future</Text>
              <Text style={styles.previewValue}>{generatePreview(1)}</Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel} />
              <Text style={styles.previewValue}>{generatePreview(2)}</Text>
            </View>
            <View style={styles.lastInvoice}>
              <Text style={styles.lastInvoiceText}>
                Last invoice created: {generatePreview(-1)} on Feb 10, 2026
              </Text>
            </View>
          </Card>

          {/* Advanced Settings */}
          <TouchableOpacity
            style={styles.advancedHeader}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.sectionTitle}>ADVANCED SETTINGS</Text>
            <Ionicons
              name={showAdvanced ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.gray400}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <Card style={styles.card}>
              <Text style={styles.cardLabel}>If duplicate number detected:</Text>
              <TouchableOpacity
                style={styles.radioRow}
                onPress={() => setDuplicateCheck('error')}
              >
                <View style={[styles.radio, duplicateCheck === 'error' && styles.radioChecked]}>
                  {duplicateCheck === 'error' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Show error (Recommended)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioRow} onPress={() => setDuplicateCheck('auto')}>
                <View style={[styles.radio, duplicateCheck === 'auto' && styles.radioChecked]}>
                  {duplicateCheck === 'auto' && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Auto-increment to next available</Text>
              </TouchableOpacity>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Allow manual override</Text>
                  <Text style={styles.toggleHint}>Edit invoice number when creating</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switch, manualOverride && styles.switchOn]}
                  onPress={() => setManualOverride(!manualOverride)}
                >
                  <View style={[styles.switchKnob, manualOverride && styles.switchKnobOn]} />
                </TouchableOpacity>
              </View>

              <SelectInput
                label="Number Padding"
                value={padding.toString()}
                onValueChange={(v) => setPadding(parseInt(v, 10))}
                options={PADDING_OPTIONS}
              />
              <Text style={styles.toggleHint}>Minimum number of digits for the sequence number</Text>

              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Skip deleted numbers</Text>
                  <Text style={styles.toggleHint}>Keep gaps for deleted invoices</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switch, skipDeleted && styles.switchOn]}
                  onPress={() => setSkipDeleted(!skipDeleted)}
                >
                  <View style={[styles.switchKnob, skipDeleted && styles.switchKnobOn]} />
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            onPress={handleSave}
            disabled={loading || isSaving}
            style={styles.saveBtn}
          >
            {isSaving ? (
              <View style={styles.saveBtnContent}>
                <Ionicons name="sync" size={20} color={colors.white} style={{ marginRight: 8 }} />
                <Text style={styles.saveBtnText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveBtnText}>Save Invoice Settings</Text>
            )}
          </Button>
        </View>
      </View>

      {/* Component Picker Modal */}
      <Modal
        visible={showComponentPicker}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowComponentPicker(false)}
        >
          <View style={styles.pickerContent}>
            <Text style={styles.pickerTitle}>Add Component</Text>
            {CUSTOM_COMPONENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.type}
                style={styles.pickerOption}
                onPress={() =>
                  addCustomComponent(opt.type, opt.label, opt.defaultValue)
                }
              >
                <Text style={styles.pickerOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancel}
              onPress={() => setShowComponentPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  toast: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    zIndex: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastSuccess: { backgroundColor: colors.green600 },
  toastWarning: { backgroundColor: colors.amber500 },
  toastText: { color: colors.white, fontSize: 14, fontWeight: '600' },
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
  title: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: colors.purple50,
  },
  loadingText: { fontSize: 14, color: colors.purple },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    gap: 24,
  },
  tab: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.purple },
  tabText: { fontSize: 14, fontWeight: '500', color: colors.gray500 },
  tabTextActive: { fontSize: 14, fontWeight: '500', color: colors.purple },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400,
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioChecked: { borderColor: colors.purple, backgroundColor: colors.purple },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  radioLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, flex: 1 },
  presetContent: { marginLeft: 28, marginBottom: 12 },
  hint: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  italicHint: { fontSize: 11, color: colors.gray400, fontStyle: 'italic', marginTop: 8 },
  customContent: { marginLeft: 28, marginBottom: 12 },
  customCard: { padding: 16, marginBottom: 8 },
  customHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  customSectionLabel: { fontSize: 11, fontWeight: '700', color: colors.gray500 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 12, fontWeight: '700', color: colors.purple },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  componentBody: { flex: 1, marginLeft: 8 },
  componentLabel: { fontSize: 12, fontWeight: '500', color: colors.gray700 },
  componentInput: {
    marginTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    paddingVertical: 4,
    fontSize: 12,
    color: colors.navy,
  },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200, marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 12 },
  previewHighlight: { fontWeight: '700', color: colors.purple },
  resetHint: { backgroundColor: colors.gray50, padding: 8, borderRadius: 8, marginTop: 8 },
  resetHintText: { fontSize: 12, color: colors.gray500 },
  previewCard: { borderColor: 'rgba(124, 58, 237, 0.2)' },
  previewIntro: { fontSize: 14, color: colors.gray500, marginBottom: 12 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  previewLabel: { fontSize: 12, color: colors.gray400 },
  previewValue: { fontSize: 14, color: colors.gray500 },
  previewNext: { backgroundColor: colors.purple50, marginHorizontal: -8, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 8 },
  previewNextLabel: { fontSize: 12, fontWeight: '700', color: colors.purple },
  previewNextValue: { fontSize: 16, fontWeight: '700', color: colors.purple },
  lastInvoice: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  lastInvoiceText: { fontSize: 11, color: colors.gray400 },
  advancedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: colors.navy },
  toggleHint: { fontSize: 12, color: colors.gray500, marginTop: 2 },
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
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  saveBtn: { height: 48, justifyContent: 'center', alignItems: 'center' },
  saveBtnContent: { flexDirection: 'row', alignItems: 'center' },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: colors.white },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  pickerTitle: { fontSize: 12, fontWeight: '700', color: colors.gray400, marginBottom: 12 },
  pickerOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  pickerOptionText: { fontSize: 16, color: colors.navy },
  pickerCancel: { marginTop: 16, alignItems: 'center' },
  pickerCancelText: { fontSize: 16, fontWeight: '600', color: colors.purple },
});
