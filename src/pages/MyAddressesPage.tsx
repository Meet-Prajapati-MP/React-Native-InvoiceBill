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
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/SelectInput';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface Address {
  id: string;
  type: 'home' | 'business' | 'billing';
  businessType: string;
  isDefault: boolean;
  fullName: string;
  professionalTitle?: string;
  phone: string;
  email?: string;
  website?: string;
  building: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  gstin?: string;
  pan?: string;
  cin?: string;
}

interface MyAddressesPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddressRow = {
  id: string;
  type: string;
  business_type?: string;
  is_default?: boolean;
  full_name: string;
  professional_title?: string;
  phone: string;
  email?: string;
  website?: string;
  building?: string;
  street?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  gstin?: string;
  pan?: string;
  cin?: string;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    type: (row.type as Address['type']) || 'home',
    businessType: row.business_type || 'individual',
    isDefault: !!row.is_default,
    fullName: row.full_name,
    professionalTitle: row.professional_title,
    phone: row.phone,
    email: row.email,
    website: row.website,
    building: row.building || '',
    street: row.street || '',
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    country: row.country || 'India',
    gstin: row.gstin,
    pan: row.pan,
    cin: row.cin,
  };
}

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual / Freelancer' },
  { value: 'sole_prop', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership / LLP' },
  { value: 'pvt_ltd', label: 'Private Limited' },
  { value: 'public_ltd', label: 'Public Limited' },
  { value: 'other', label: 'Other' },
];

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual / Freelancer',
  sole_prop: 'Sole Proprietorship',
  partnership: 'Partnership / LLP',
  pvt_ltd: 'Private Limited',
  public_ltd: 'Public Limited',
  other: 'Other',
};

const STATES = [
  'Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Rajasthan',
  'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana', 'Andhra Pradesh',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Goa', 'Bihar', 'Odisha',
  'Andhra Pradesh', 'Assam', 'Chhattisgarh', 'Himachal Pradesh', 'Jharkhand',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura',
  'Uttarakhand', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
].map((s) => ({ value: s, label: s }));

export function MyAddressesPage({ isOpen, onClose }: MyAddressesPageProps) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showGstSection, setShowGstSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [noGst, setNoGst] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    businessType: 'individual',
    country: 'India',
    fullName: '',
    phone: '',
    email: '',
  });

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<AddressRow[]>('/addresses');
      setAddresses((data || []).map(mapAddress));
    } catch {
      setShowToast({ type: 'error', message: 'Failed to load addresses' });
      setTimeout(() => setShowToast(null), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchAddresses();
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      type: 'home',
      businessType: 'individual',
      country: 'India',
      fullName: '',
      phone: '',
      email: '',
      building: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      gstin: '',
      pan: '',
      cin: '',
    });
    setEditingId(null);
    setErrors({});
    setShowGstSection(false);
    setShowPreview(false);
    setNoGst(false);
  };

  const handleAddNew = () => {
    resetForm();
    setView('form');
  };

  const handleEdit = (address: Address) => {
    setFormData({ ...address });
    setEditingId(address.id);
    setShowGstSection(!!address.gstin || !!address.pan || !!address.cin);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setShowToast({ type: 'success', message: 'Address deleted' });
    } catch {
      setShowToast({ type: 'error', message: 'Failed to delete address' });
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}`, { is_default: true });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      setShowToast({ type: 'success', message: 'Default address updated' });
    } catch {
      setShowToast({ type: 'error', message: 'Failed to set default' });
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName?.trim()) newErrors.fullName = 'Name is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.building?.trim()) newErrors.building = 'Building required';
    if (!formData.street?.trim()) newErrors.street = 'Street/Area required';
    if (!formData.city?.trim()) newErrors.city = 'City required';
    if (!formData.state?.trim()) newErrors.state = 'State required';
    const pincode = formData.pincode?.replace(/\D/g, '') ?? '';
    if (!pincode) newErrors.pincode = 'PIN required';
    else if (pincode.length !== 6) newErrors.pincode = 'PIN must be 6 digits';
    if (formData.gstin && formData.gstin.length !== 15) newErrors.gstin = 'GSTIN must be 15 chars';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setShowToast({ type: 'error', message: 'Please fix errors' });
      setTimeout(() => setShowToast(null), 2000);
      return;
    }
    setIsSaving(true);
    const isDefault = formData.isDefault ?? addresses.length === 0;
    const payload = {
      type: formData.type || 'home',
      business_type: formData.businessType || 'individual',
      is_default: isDefault,
      full_name: formData.fullName?.trim() || '',
      professional_title: formData.professionalTitle?.trim() || undefined,
      phone: formData.phone?.trim() || '',
      email: formData.email?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      building: formData.building?.trim() || '',
      street: formData.street?.trim() || '',
      city: formData.city?.trim() || '',
      state: formData.state?.trim() || '',
      pincode: formData.pincode?.trim() || '',
      country: formData.country?.trim() || 'India',
      gstin: formData.gstin?.trim() || undefined,
      pan: formData.pan?.trim() || undefined,
      cin: formData.cin?.trim() || undefined,
    };
    try {
      if (editingId) {
        const { data } = await api.patch<AddressRow>(`/addresses/${editingId}`, payload);
        setAddresses((prev) => prev.map((a) => (a.id === editingId ? mapAddress(data) : a)));
      } else {
        const { data } = await api.post<AddressRow>('/addresses', payload);
        setAddresses((prev) => (isDefault ? [mapAddress(data), ...prev.map((a) => ({ ...a, isDefault: false }))] : [...prev, mapAddress(data)]));
      }
      setShowToast({ type: 'success', message: 'Address saved successfully!' });
      setTimeout(() => {
        setShowToast(null);
        setView('list');
      }, 1500);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save address';
      setShowToast({ type: 'error', message: msg });
      setTimeout(() => setShowToast(null), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseLocation = () => {
    setFormData((prev) => ({
      ...prev,
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390007',
      country: 'India',
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
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

        <View style={styles.header}>
          <TouchableOpacity
            onPress={view === 'form' ? () => setView('list') : onClose}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {view === 'list' ? 'My Addresses' : editingId ? 'Edit Address' : 'Add New Address'}
          </Text>
          {view === 'list' ? (
            <TouchableOpacity onPress={handleAddNew} style={styles.addBtn}>
              <Ionicons name="add-outline" size={18} color={colors.purple} />
              <Text style={styles.addBtnText}>Add New</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            >
              <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, view === 'form' && styles.formScroll]}
        >
          {view === 'list' ? (
            isLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptySub}>Loading...</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="location-outline" size={32} color={colors.purple} />
                </View>
                <Text style={styles.emptyTitle}>Add Your First Address</Text>
                <Text style={styles.emptySub}>
                  Required for sending and receiving invoices and payments.
                </Text>
                <Button onPress={handleAddNew}>Add Address</Button>
              </View>
            ) : (
              addresses.map((addr) => (
                <Card
                  key={addr.id}
                  style={[styles.addressCard, addr.isDefault && styles.addressCardDefault]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View
                        style={[
                          styles.typeIcon,
                          addr.type === 'home' ? styles.typeIconHome : styles.typeIconBusiness,
                        ]}
                      >
                        <Ionicons
                          name={addr.type === 'home' ? 'home' : 'business'}
                          size={18}
                          color={addr.type === 'home' ? colors.blue600 : colors.purple}
                        />
                      </View>
                      <View>
                        <Text style={styles.cardTypeLabel}>
                          {addr.type === 'home' ? 'Home' : addr.type === 'business' ? 'Business' : 'Billing'} Address
                        </Text>
                        <Text style={styles.cardTypeSub}>
                          {BUSINESS_TYPE_LABELS[addr.businessType] || 'Individual'}
                        </Text>
                      </View>
                      {addr.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="star" size={10} color={colors.white} />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardName}>{addr.fullName}</Text>
                    {addr.professionalTitle && (
                      <Text style={styles.cardSub}>{addr.professionalTitle}</Text>
                    )}
                    <Text style={styles.cardLine}>{addr.building}</Text>
                    <Text style={styles.cardLine}>{addr.street}</Text>
                    <Text style={styles.cardLine}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </Text>
                    <Text style={styles.cardLine}>{addr.country}</Text>
                    <Text style={styles.cardLine}>{addr.phone}</Text>
                    {addr.email && <Text style={styles.cardEmail}>{addr.email}</Text>}

                    <View style={styles.taxRow}>
                      {addr.gstin ? (
                        <View style={styles.taxBadgePurple}>
                          <Text style={styles.taxBadgePurpleText}>
                            GSTIN: {addr.gstin} ✓
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.taxBadgeGray}>
                          <Text style={styles.taxBadgeGrayText}>GST: Not Registered</Text>
                        </View>
                      )}
                      {addr.pan && (
                        <View style={styles.taxBadgeGray}>
                          <Text style={styles.taxBadgeGrayText}>PAN: {addr.pan}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.cardAction} onPress={() => handleEdit(addr)}>
                      <Ionicons name="create-outline" size={14} color={colors.gray600} />
                      <Text style={styles.cardActionText}>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.cardActionDivider} />
                    <TouchableOpacity style={styles.cardAction} onPress={() => handleDelete(addr.id)}>
                      <Ionicons name="trash-outline" size={14} color={colors.red500} />
                      <Text style={styles.cardActionTextRed}>Delete</Text>
                    </TouchableOpacity>
                    {!addr.isDefault && (
                      <>
                        <View style={styles.cardActionDivider} />
                        <TouchableOpacity style={styles.cardAction} onPress={() => handleSetDefault(addr.id)}>
                          <Text style={styles.cardActionTextPurple}>Set Default</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </Card>
              ))
            )
          ) : (
            <View style={styles.form}>
              <Text style={styles.sectionTitle}>BUSINESS TYPE *</Text>
              {BUSINESS_TYPES.map((bt) => (
                <TouchableOpacity
                  key={bt.value}
                  style={[
                    styles.businessTypeOption,
                    formData.businessType === bt.value && styles.businessTypeOptionActive,
                  ]}
                  onPress={() => setFormData((p) => ({ ...p, businessType: bt.value }))}
                >
                  <View style={[styles.radio, formData.businessType === bt.value && styles.radioChecked]}>
                    {formData.businessType === bt.value && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.businessTypeLabel,
                      formData.businessType === bt.value && styles.businessTypeLabelActive,
                    ]}
                  >
                    {bt.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.sectionTitle}>ADDRESS LABEL *</Text>
              <View style={styles.addressTypeRow}>
                {(['home', 'business', 'billing'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.addressTypeBtn,
                      formData.type === type && styles.addressTypeBtnActive,
                    ]}
                    onPress={() => setFormData((p) => ({ ...p, type }))}
                  >
                    <Ionicons
                      name={type === 'home' ? 'home' : type === 'business' ? 'business' : 'cube'}
                      size={20}
                      color={formData.type === type ? colors.purple : colors.gray500}
                    />
                    <Text
                      style={[
                        styles.addressTypeLabel,
                        formData.type === type && styles.addressTypeLabelActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionTitle}>BASIC DETAILS</Text>
              <Input
                label="Full Name / Company Name *"
                placeholder="Your name or business name"
                value={formData.fullName}
                onChangeText={(v) => setFormData((p) => ({ ...p, fullName: v }))}
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
              {(formData.businessType === 'individual' || formData.businessType === 'sole_prop') && (
                <Input
                  label="Professional Title (Optional)"
                  placeholder="e.g., Graphic Designer"
                  value={formData.professionalTitle}
                  onChangeText={(v) => setFormData((p) => ({ ...p, professionalTitle: v }))}
                />
              )}
              <Input
                label="Phone Number *"
                value={formData.phone}
                onChangeText={(v) => setFormData((p) => ({ ...p, phone: v }))}
                placeholder="+91 98765 43210"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              <Input
                label="Email (Optional)"
                value={formData.email}
                onChangeText={(v) => setFormData((p) => ({ ...p, email: v }))}
                placeholder="you@example.com"
              />
              <Input
                label="Website (Optional)"
                value={formData.website}
                onChangeText={(v) => setFormData((p) => ({ ...p, website: v }))}
                placeholder="https://yourwebsite.com"
              />

              <Text style={styles.sectionTitle}>ADDRESS</Text>
              <Input
                label="Building / Premises *"
                value={formData.building}
                onChangeText={(v) => setFormData((p) => ({ ...p, building: v }))}
                placeholder="123, Building Name"
              />
              {errors.building ? <Text style={styles.errorText}>{errors.building}</Text> : null}
              <Input
                label="Street / Area *"
                value={formData.street}
                onChangeText={(v) => setFormData((p) => ({ ...p, street: v }))}
                placeholder="Near Railway Station, Alkapuri"
              />
              {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
              <Input
                label="City *"
                value={formData.city}
                onChangeText={(v) => setFormData((p) => ({ ...p, city: v }))}
                placeholder="Vadodara"
              />
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
              <SelectInput
                label="State *"
                value={formData.state || ''}
                onValueChange={(v) => setFormData((p) => ({ ...p, state: v }))}
                options={STATES}
                placeholder="Select State"
              />
              <Input
                label="PIN Code *"
                value={formData.pincode}
                onChangeText={(v) => setFormData((p) => ({ ...p, pincode: v.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="390007"
              />
              {errors.pincode ? <Text style={styles.errorText}>{errors.pincode}</Text> : null}
              <TouchableOpacity style={styles.useLocationBtn} onPress={handleUseLocation}>
                <Ionicons name="location-outline" size={16} color={colors.purple} />
                <Text style={styles.useLocationText}>Use Current Location</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.collapseHeader}
                onPress={() => setShowGstSection(!showGstSection)}
              >
                <View>
                  <Text style={styles.collapseTitle}>Tax & Registration (Optional)</Text>
                  <Text style={styles.collapseSub}>GST, PAN, CIN — only if applicable</Text>
                </View>
                <Ionicons name={showGstSection ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray400} />
              </TouchableOpacity>
              {showGstSection && (
                <View style={styles.collapseContent}>
                  <Input
                    label="GSTIN"
                    value={formData.gstin}
                    onChangeText={(v) => setFormData((p) => ({ ...p, gstin: noGst ? '' : v.toUpperCase() }))}
                    placeholder="29ABCDE1234F1Z5"
                  />
                  <TouchableOpacity style={styles.checkboxRow} onPress={() => setNoGst(!noGst)}>
                    <View style={[styles.checkbox, noGst && styles.checkboxChecked]}>
                      {noGst && <Ionicons name="checkmark" size={12} color={colors.white} />}
                    </View>
                    <Text style={styles.checkboxLabel}>I don't have GSTIN (Turnover &lt; ₹40L)</Text>
                  </TouchableOpacity>
                  <Input
                    label="PAN (Optional)"
                    value={formData.pan}
                    onChangeText={(v) => setFormData((p) => ({ ...p, pan: v.toUpperCase().slice(0, 10) }))}
                    placeholder="ABCDE1234F"
                  />
                  {(formData.businessType === 'pvt_ltd' || formData.businessType === 'public_ltd') && (
                    <Input
                      label="CIN (Optional)"
                      value={formData.cin}
                      onChangeText={(v) => setFormData((p) => ({ ...p, cin: v.toUpperCase() }))}
                      placeholder="U72900KA2020PTC123456"
                    />
                  )}
                </View>
              )}

              <View style={styles.defaultToggle}>
                <View>
                  <Text style={styles.defaultToggleLabel}>Set as Default</Text>
                  <Text style={styles.defaultToggleSub}>Used on new invoices</Text>
                </View>
                <TouchableOpacity
                  style={[styles.switch, formData.isDefault && styles.switchOn]}
                  onPress={() => setFormData((p) => ({ ...p, isDefault: !p.isDefault }))}
                >
                  <View style={[styles.switchKnob, formData.isDefault && styles.switchKnobOn]} />
                </TouchableOpacity>
              </View>

              <View style={{ height: 100 }} />
            </View>
          )}
        </ScrollView>

        {view === 'form' && (
          <View style={styles.formFooter}>
            <Button variant="outline" style={styles.footerCancel} onPress={() => setView('list')}>
              Cancel
            </Button>
            <Button style={styles.footerSave} onPress={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Address'}
            </Button>
          </View>
        )}
      </View>
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
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: colors.purple, marginLeft: 4 },
  saveBtn: { paddingVertical: 8 },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: colors.purple },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  formScroll: { paddingBottom: 120 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purple50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.gray500, textAlign: 'center', marginBottom: 24, paddingHorizontal: 24 },
  addressCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  addressCardDefault: {
    borderColor: colors.purple,
    backgroundColor: 'rgba(124, 58, 237, 0.06)',
  },
  cardHeader: { marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeIconHome: { backgroundColor: colors.blue100 },
  typeIconBusiness: { backgroundColor: colors.purple100 },
  cardTypeLabel: { fontSize: 14, fontWeight: '700', color: colors.navy },
  cardTypeSub: { fontSize: 10, color: colors.gray400, marginTop: 2, textTransform: 'capitalize' },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  defaultBadgeText: { fontSize: 10, fontWeight: '700', color: colors.white, marginLeft: 4 },
  cardBody: { marginBottom: 12, paddingLeft: 4 },
  cardName: { fontSize: 14, fontWeight: '700', color: colors.navy },
  cardSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  cardLine: { fontSize: 14, color: colors.gray600, marginTop: 2 },
  cardEmail: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  taxRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  taxBadgePurple: {
    backgroundColor: colors.purple50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  taxBadgePurpleText: { fontSize: 10, fontWeight: '600', color: colors.purple },
  taxBadgeGray: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  taxBadgeGrayText: { fontSize: 10, fontWeight: '500', color: colors.gray600 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    paddingTop: 12,
  },
  cardAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cardActionText: { fontSize: 12, fontWeight: '500', color: colors.gray600, marginLeft: 4 },
  cardActionTextRed: { fontSize: 12, fontWeight: '500', color: colors.red500, marginLeft: 4 },
  cardActionTextPurple: { fontSize: 12, fontWeight: '500', color: colors.purple },
  cardActionDivider: { width: 1, height: 16, backgroundColor: colors.gray200 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: colors.gray400, letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  form: { paddingBottom: 24 },
  businessTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray100,
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  businessTypeOptionActive: { borderColor: colors.purple, backgroundColor: colors.purple50 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioChecked: { borderColor: colors.purple },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.purple },
  businessTypeLabel: { fontSize: 13, fontWeight: '600', color: colors.navy },
  businessTypeLabelActive: { color: colors.purple },
  addressTypeRow: { flexDirection: 'row', marginBottom: 20, gap: 8 },
  addressTypeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray100,
    backgroundColor: colors.white,
  },
  addressTypeBtnActive: { borderColor: colors.purple, backgroundColor: colors.purple50 },
  addressTypeLabel: { fontSize: 11, fontWeight: '700', color: colors.gray500, marginTop: 6 },
  addressTypeLabelActive: { color: colors.purple },
  useLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  useLocationText: { fontSize: 14, fontWeight: '600', color: colors.purple, marginLeft: 6 },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    marginBottom: 8,
  },
  collapseTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  collapseSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  collapseContent: { marginBottom: 16, padding: 16, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: { backgroundColor: colors.purple, borderColor: colors.purple },
  checkboxLabel: { fontSize: 12, color: colors.gray600 },
  errorText: { fontSize: 12, color: colors.red500, marginTop: 4, marginBottom: 4 },
  defaultToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
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
  formFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: 12,
  },
  footerCancel: { flex: 1 },
  footerSave: { flex: 2 },
});
