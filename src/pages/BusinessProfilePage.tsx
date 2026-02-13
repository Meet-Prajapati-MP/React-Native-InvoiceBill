import React, { useState } from 'react';
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
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { SelectInput } from '../components/SelectInput';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

interface BusinessProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLES = [
  { value: 'Owner', label: 'Owner' },
  { value: 'Director', label: 'Director' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Accountant', label: 'Accountant' },
  { value: 'Finance Manager', label: 'Finance Manager' },
  { value: 'Other', label: 'Other' },
];

const BUSINESS_TYPES = [
  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Private Limited (Pvt Ltd)', label: 'Private Limited (Pvt Ltd)' },
  { value: 'LLP', label: 'Limited Liability Partnership (LLP)' },
  { value: 'Public Limited', label: 'Public Limited' },
  { value: 'OPC', label: 'One Person Company (OPC)' },
  { value: 'Other', label: 'Other' },
];

const INDUSTRIES = [
  { value: 'Technology', label: 'Technology / IT Services' },
  { value: 'Design', label: 'Design & Creative' },
  { value: 'Marketing', label: 'Marketing & Advertising' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail & E-commerce' },
  { value: 'Other', label: 'Other' },
];

const STATES = [
  'Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Rajasthan',
  'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana', 'Andhra Pradesh',
  'Madhya Pradesh', 'Punjab', 'Haryana', 'Goa', 'Bihar', 'Odisha', 'Other',
].map((s) => ({ value: s, label: s }));

const COUNTRIES = [
  { value: 'India', label: 'India' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'UAE', label: 'UAE' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Other', label: 'Other' },
];

export function BusinessProfilePage({ isOpen, onClose }: BusinessProfilePageProps) {
  const [accountType, setAccountType] = useState<'individual' | 'business' | null>(null);
  const [showLogoSection, setShowLogoSection] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const [formData, setFormData] = useState({
    fullName: 'Ankit Shah',
    professionalTitle: '',
    pan: '',
    companyName: '',
    role: 'Owner',
    businessType: '',
    industry: '',
    registrationNumber: '',
    gstin: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    accountHolder: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    bankName: '',
    branchName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    let formatted = value;
    if (['pan', 'ifsc', 'gstin'].includes(field)) formatted = value.toUpperCase();
    if (['pincode', 'accountNumber', 'confirmAccountNumber'].includes(field)) formatted = value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, [field]: formatted }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'ifsc' && formatted.length === 11) {
      if (formatted.startsWith('SBIN')) {
        setFormData((prev) => ({ ...prev, bankName: 'State Bank of India', branchName: 'Main Branch' }));
      } else if (formatted.startsWith('HDFC')) {
        setFormData((prev) => ({ ...prev, bankName: 'HDFC Bank', branchName: 'City Branch' }));
      }
    }
  };

  const handleSave = () => {
    if (!accountType) return;
    const required = accountType === 'individual'
      ? ['fullName', 'addressLine1', 'city', 'state', 'pincode']
      : ['companyName', 'fullName', 'addressLine1', 'city', 'state', 'pincode'];
    const newErrors: Record<string, string> = {};
    for (const f of required) {
      if (!(formData as any)[f]?.trim()) newErrors[f] = 'Required';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShowToast({ type: 'error', message: 'Please fix errors before saving.' });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowToast({ type: 'success', message: 'Business profile updated! ✓' });
      setTimeout(() => {
        setShowToast(null);
        onClose();
      }, 2000);
    }, 1500);
  };

  const handleLogoUpload = () => {
    setLogo('https://via.placeholder.com/100/7C3AED/FFFFFF?text=AS');
  };

  const handleUseLocation = () => {
    setFormData((prev) => ({
      ...prev,
      city: 'Vadodara',
      state: 'Gujarat',
      pincode: '390001',
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        {/* Toast */}
        {showToast && (
          <View style={[styles.toast, showToast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Ionicons
              name={showToast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={colors.white}
            />
            <Text style={styles.toastText}>{showToast.message}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Business Profile</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Account Type */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>I am a:</Text>
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setAccountType('individual')}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, accountType === 'individual' && styles.radioActive]}>
                {accountType === 'individual' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>Individual / Freelancer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioRow}
              onPress={() => setAccountType('business')}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, accountType === 'business' && styles.radioActive]}>
                {accountType === 'business' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>Company / Business</Text>
            </TouchableOpacity>
          </Card>

          {accountType && (
            <>
              {/* Basic Info */}
              <View style={styles.section}>
                {accountType === 'individual' ? (
                  <>
                    <Input
                      label="Full Name *"
                      value={formData.fullName}
                      onChangeText={(v) => handleInputChange('fullName', v)}
                      placeholder="Enter your full name"
                    />
                    <Input
                      label="Professional Title"
                      value={formData.professionalTitle}
                      onChangeText={(v) => handleInputChange('professionalTitle', v)}
                      placeholder="e.g., Freelance Designer"
                    />
                    <Input
                      label="PAN Card Number"
                      value={formData.pan}
                      onChangeText={(v) => handleInputChange('pan', v)}
                      placeholder="ABCDE1234F"
                    />
                  </>
                ) : (
                  <>
                    <Input
                      label="Company/Business Name *"
                      value={formData.companyName}
                      onChangeText={(v) => handleInputChange('companyName', v)}
                      placeholder="Enter company name"
                    />
                    <Input
                      label="Your Name *"
                      value={formData.fullName}
                      onChangeText={(v) => handleInputChange('fullName', v)}
                    />
                    <SelectInput
                      label="Your Role"
                      value={formData.role}
                      onValueChange={(v) => handleInputChange('role', v)}
                      options={ROLES}
                    />
                    <SelectInput
                      label="Business Type"
                      value={formData.businessType}
                      onValueChange={(v) => handleInputChange('businessType', v)}
                      options={BUSINESS_TYPES}
                      placeholder="Select Type"
                    />
                    <SelectInput
                      label="Industry"
                      value={formData.industry}
                      onValueChange={(v) => handleInputChange('industry', v)}
                      options={INDUSTRIES}
                      placeholder="Select Industry"
                    />
                    <Input
                      label="Company Registration Number"
                      value={formData.registrationNumber}
                      onChangeText={(v) => handleInputChange('registrationNumber', v)}
                      placeholder="CIN/Registration Number"
                    />
                    <Input
                      label="GSTIN"
                      value={formData.gstin}
                      onChangeText={(v) => handleInputChange('gstin', v)}
                      placeholder="24ABCDE1234F1Z5"
                    />
                    <Input
                      label="Company PAN"
                      value={formData.pan}
                      onChangeText={(v) => handleInputChange('pan', v)}
                      placeholder="ABCDE1234F"
                    />

                    {/* Logo - Business only */}
                    <View style={styles.logoSection}>
                      <Text style={styles.groupLabel}>BRANDING</Text>
                      <Card>
                        <View style={styles.logoToggle}>
                          <Text style={styles.logoLabel}>Show logo on invoices?</Text>
                          <Switch
                            value={showLogoSection}
                            onValueChange={setShowLogoSection}
                            trackColor={{ false: colors.gray200, true: colors.purple }}
                            thumbColor={colors.white}
                          />
                        </View>
                        {showLogoSection && (
                          <View style={styles.logoContent}>
                            {logo ? (
                              <>
                                <Image source={{ uri: logo }} style={styles.logoPreview} resizeMode="contain" />
                                <View style={styles.logoActions}>
                                  <Button variant="outline" onPress={handleLogoUpload} style={styles.logoBtn}>
                                    Change Logo
                                  </Button>
                                  <TouchableOpacity onPress={() => setLogo(null)} style={[styles.logoBtn, styles.removeLogoBtn]}>
                                    <Text style={styles.removeLogoText}>Remove</Text>
                                  </TouchableOpacity>
                                </View>
                              </>
                            ) : (
                              <TouchableOpacity style={styles.uploadArea} onPress={handleLogoUpload}>
                                <View style={styles.uploadIcon}>
                                  <Ionicons name="cloud-upload-outline" size={24} color={colors.purple} />
                                </View>
                                <Text style={styles.uploadText}>Upload Logo</Text>
                                <Text style={styles.uploadHint}>200x200px • Max 2MB</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </Card>
                    </View>
                  </>
                )}
              </View>

              {/* Address */}
              <View style={styles.section}>
                <Text style={styles.groupLabel}>BUSINESS ADDRESS</Text>
                <Input
                  label="Address Line 1 *"
                  value={formData.addressLine1}
                  onChangeText={(v) => handleInputChange('addressLine1', v)}
                  placeholder="Building No., Street"
                />
                <Input
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChangeText={(v) => handleInputChange('addressLine2', v)}
                  placeholder="Area, Landmark"
                />
                <Input
                  label="City *"
                  value={formData.city}
                  onChangeText={(v) => handleInputChange('city', v)}
                />
                <SelectInput
                  label="State *"
                  value={formData.state}
                  onValueChange={(v) => handleInputChange('state', v)}
                  options={STATES}
                  placeholder="Select State"
                />
                <Input
                  label="PIN Code *"
                  value={formData.pincode}
                  onChangeText={(v) => handleInputChange('pincode', v)}
                  placeholder="6 digits"
                />
                <SelectInput
                  label="Country"
                  value={formData.country}
                  onValueChange={(v) => handleInputChange('country', v)}
                  options={COUNTRIES}
                />
                <Button variant="outline" onPress={handleUseLocation} style={styles.locationBtn}>
                  <Ionicons name="location-outline" size={16} color={colors.purple} />
                  <Text style={styles.locationBtnText}> Use Current Location</Text>
                </Button>
              </View>

              {/* Bank Details */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.collapseHeader}
                  onPress={() => setShowBankDetails(!showBankDetails)}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.collapseTitle}>Bank Details (Optional)</Text>
                    <Text style={styles.collapseSub}>Add bank details for receiving payments</Text>
                  </View>
                  <Ionicons name={showBankDetails ? 'chevron-up' : 'chevron-down'} size={20} color={colors.gray500} />
                </TouchableOpacity>
                {showBankDetails && (
                  <View style={styles.bankContent}>
                    <Input
                      label="Account Holder Name"
                      value={formData.accountHolder}
                      onChangeText={(v) => handleInputChange('accountHolder', v)}
                    />
                    <View style={styles.inputWithEye}>
                      <Input
                        label="Account Number"
                        value={formData.accountNumber}
                        onChangeText={(v) => handleInputChange('accountNumber', v)}
                        placeholder="9-18 digits"
                        secureTextEntry={!showAccountNumber}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowAccountNumber(!showAccountNumber)}
                      >
                        <Ionicons name={showAccountNumber ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray500} />
                      </TouchableOpacity>
                    </View>
                    <Input
                      label="Confirm Account Number"
                      value={formData.confirmAccountNumber}
                      onChangeText={(v) => handleInputChange('confirmAccountNumber', v)}
                    />
                    <Input
                      label="IFSC Code"
                      value={formData.ifsc}
                      onChangeText={(v) => handleInputChange('ifsc', v)}
                      placeholder="SBIN0001234"
                    />
                    <Input
                      label="Bank Name"
                      value={formData.bankName}
                      onChangeText={(v) => handleInputChange('bankName', v)}
                      placeholder="Auto-filled from IFSC"
                    />
                    <Input
                      label="Branch Name"
                      value={formData.branchName}
                      onChangeText={(v) => handleInputChange('branchName', v)}
                    />
                  </View>
                )}
              </View>

              {/* Invoice Preview */}
              <View style={styles.section}>
                <Text style={styles.groupLabel}>PREVIEW ON INVOICE</Text>
                <TouchableOpacity
                  style={styles.previewCard}
                  onPress={() => setShowFullPreview(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.previewHeader}>
                    {accountType === 'business' && logo ? (
                      <Image source={{ uri: logo }} style={styles.previewLogo} />
                    ) : (
                      <View style={styles.previewPlaceholder}>
                        <Text style={styles.previewPlaceholderText}>
                          {(accountType === 'business' ? formData.companyName || 'C' : formData.fullName || 'A')[0]}
                        </Text>
                      </View>
                    )}
                    <View style={styles.previewMeta}>
                      <Text style={styles.previewLabel}>INVOICE</Text>
                      <Text style={styles.previewNum}>#INV-001</Text>
                    </View>
                  </View>
                  <Text style={styles.previewFrom}>From</Text>
                  <Text style={styles.previewName}>
                    {accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName}
                  </Text>
                  <Text style={styles.previewDetails}>
                    {formData.addressLine1 && `${formData.addressLine1}, `}
                    {formData.city} - {formData.pincode}
                  </Text>
                  <Text style={styles.previewTap}>
                    <Ionicons name="eye-outline" size={12} /> Tap to see full preview
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            onPress={handleSave}
            disabled={!accountType || isSaving}
            style={styles.saveBtn}
          >
            {isSaving ? 'Saving...' : 'Save Business Profile'}
          </Button>
        </View>

        {/* Full Preview Modal */}
        {showFullPreview && (
          <Modal visible animationType="slide">
            <View style={styles.previewModal}>
              <View style={styles.previewModalHeader}>
                <TouchableOpacity onPress={() => setShowFullPreview(false)}>
                  <Ionicons name="arrow-back" size={24} color={colors.navy} />
                </TouchableOpacity>
                <Text style={styles.previewModalTitle}>Invoice Preview</Text>
                <View style={styles.sampleBadge}>
                  <Text style={styles.sampleText}>SAMPLE</Text>
                </View>
              </View>
              <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewScrollContent}>
                <View style={styles.invoiceDoc}>
                  <View style={styles.invoiceAccent} />
                  <View style={styles.invoiceBody}>
                    {/* Header: Sender + Invoice ID */}
                    <View style={styles.invoiceTopSection}>
                      <View style={styles.invoiceSender}>
                        {accountType === 'business' && (showLogoSection && logo) ? (
                          <Image source={{ uri: logo }} style={styles.invoiceAvatar} resizeMode="contain" />
                        ) : (
                          <View style={styles.invoiceAvatarPlaceholder}>
                            <Text style={styles.invoiceAvatarText}>
                              {(accountType === 'business' ? formData.companyName || 'C' : formData.fullName || 'A')[0].toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <View style={styles.invoiceSenderInfo}>
                          <Text style={styles.invoiceSenderName}>
                            {accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name'}
                          </Text>
                          <Text style={styles.invoiceSenderSub}>
                            {accountType === 'business' ? `${formData.fullName}${formData.role ? ` (${formData.role})` : ''}` : formData.professionalTitle || 'Freelancer'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.invoiceMetaRight}>
                        <Text style={styles.invoiceTitle}>INVOICE</Text>
                        <Text style={styles.invoiceId}>#INV-001</Text>
                      </View>
                    </View>

                    {/* From / Bill To */}
                    <View style={styles.fromBillToRow}>
                      <View style={styles.fromBillCol}>
                        <Text style={styles.fromBillLabel}>FROM</Text>
                        <Text style={styles.fromBillName}>
                          {accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name'}
                        </Text>
                        {accountType === 'business' && (
                          <Text style={styles.fromBillSub}>{formData.fullName}{formData.role ? ` (${formData.role})` : ''}</Text>
                        )}
                        {accountType === 'individual' && formData.professionalTitle && (
                          <Text style={styles.fromBillSub}>{formData.professionalTitle}</Text>
                        )}
                        <Text style={styles.fromBillAddr}>
                          {formData.addressLine1 || '123, MG Road'}
                          {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}
                        </Text>
                        <Text style={styles.fromBillAddr}>
                          {formData.city || 'Vadodara'}, {formData.state || 'Gujarat'} - {formData.pincode || '390001'}
                        </Text>
                        {accountType === 'business' && (
                          <Text style={styles.fromBillAddr}>GSTIN: {formData.gstin || '24ABCDE1234F1Z5'}</Text>
                        )}
                        {accountType === 'individual' && (
                          <Text style={styles.fromBillAddr}>PAN: {formData.pan || 'ABCDE1234F'}</Text>
                        )}
                      </View>
                      <View style={styles.fromBillCol}>
                        <Text style={styles.fromBillLabel}>BILL TO</Text>
                        <Text style={styles.fromBillName}>Priya Sharma</Text>
                        <Text style={styles.fromBillSub}>Creative Studio Pvt Ltd</Text>
                        <Text style={styles.fromBillAddr}>45, Park Avenue</Text>
                        <Text style={styles.fromBillAddr}>Mumbai, Maharashtra - 400001</Text>
                        <Text style={styles.fromBillAddr}>GSTIN: 27BBBBB5678B1Z9</Text>
                      </View>
                    </View>

                    {/* Date / Due / Status */}
                    <View style={styles.metaCardsRow}>
                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>DATE</Text>
                        <Text style={styles.metaCardValue}>Oct 25, 2024</Text>
                      </View>
                      <View style={styles.metaCard}>
                        <Text style={styles.metaCardLabel}>DUE DATE</Text>
                        <Text style={styles.metaCardValue}>Nov 10, 2024</Text>
                      </View>
                      <View style={[styles.metaCard, styles.metaCardPurple]}>
                        <Text style={[styles.metaCardLabel, styles.metaCardLabelPurple]}>STATUS</Text>
                        <Text style={styles.metaCardValuePurple}>Unpaid</Text>
                      </View>
                    </View>

                    {/* Line Items Table */}
                    <View style={styles.lineItemsTable}>
                      <View style={styles.lineItemsHeader}>
                        <View style={styles.lineItemsItemCol}><Text style={styles.lineItemsHeaderText}>ITEM</Text></View>
                        <View style={styles.lineItemsQtyCol}><Text style={[styles.lineItemsHeaderText, styles.lineItemCenter]}>QTY</Text></View>
                        <View style={styles.lineItemsRateCol}><Text style={[styles.lineItemsHeaderText, styles.lineItemRight]}>RATE</Text></View>
                        <View style={styles.lineItemsAmtCol}><Text style={[styles.lineItemsHeaderText, styles.lineItemRight]}>AMOUNT</Text></View>
                      </View>
                      {[
                        { item: 'Website Design', desc: 'Full responsive website', qty: 1, rate: 45000 },
                        { item: 'Logo Design', desc: 'Brand identity package', qty: 1, rate: 15000 },
                        { item: 'SEO Setup', desc: 'On-page optimization', qty: 1, rate: 8000 },
                      ].map((row, i) => (
                        <View key={i} style={styles.lineItemsRow}>
                          <View style={styles.lineItemsItemCol}>
                            <Text style={styles.lineItemName}>{row.item}</Text>
                            <Text style={styles.lineItemDesc}>{row.desc}</Text>
                          </View>
                          <View style={styles.lineItemsQtyCol}><Text style={[styles.lineItemVal, styles.lineItemCenter]}>{row.qty}</Text></View>
                          <View style={styles.lineItemsRateCol}><Text style={[styles.lineItemVal, styles.lineItemRight]}>{formatINR(row.rate)}</Text></View>
                          <View style={styles.lineItemsAmtCol}><Text style={[styles.lineItemAmt, styles.lineItemRight]}>{formatINR(row.qty * row.rate)}</Text></View>
                        </View>
                      ))}
                    </View>

                    {/* Totals */}
                    <View style={styles.totalsSection}>
                      <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Subtotal</Text>
                        <Text style={styles.totalsValue}>{formatINR(68000)}</Text>
                      </View>
                      {accountType === 'business' && (
                        <>
                          <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>CGST (9%)</Text>
                            <Text style={styles.totalsValue}>{formatINR(6120)}</Text>
                          </View>
                          <View style={styles.totalsRow}>
                            <Text style={styles.totalsLabel}>SGST (9%)</Text>
                            <Text style={styles.totalsValue}>{formatINR(6120)}</Text>
                          </View>
                        </>
                      )}
                      <View style={[styles.totalsRow, styles.totalsRowTotal]}>
                        <Text style={styles.totalsLabelBold}>Total</Text>
                        <Text style={styles.totalsValuePurple}>
                          {formatINR(accountType === 'business' ? 80240 : 68000)}
                        </Text>
                      </View>
                    </View>

                    {/* Amount in Words */}
                    <View style={styles.amountWordsBox}>
                      <Text style={styles.amountWordsLabel}>AMOUNT IN WORDS</Text>
                      <Text style={styles.amountWordsValue}>
                        {accountType === 'business' ? 'Eighty Thousand Two Hundred and Forty Rupees Only' : 'Sixty Eight Thousand Rupees Only'}
                      </Text>
                    </View>

                    {/* Bank Details */}
                    <View style={styles.bankDetailsBox}>
                      <Text style={styles.bankDetailsLabel}>BANK DETAILS</Text>
                      <View style={styles.bankDetailsGrid}>
                        <View style={styles.bankDetailsCell}>
                          <Text style={styles.bankDetailsCellLabel}>Account Holder</Text>
                          <Text style={styles.bankDetailsCellValue}>
                            {formData.accountHolder || (accountType === 'business' ? formData.companyName || 'Your Company' : formData.fullName || 'Your Name')}
                          </Text>
                        </View>
                        <View style={styles.bankDetailsCell}>
                          <Text style={styles.bankDetailsCellLabel}>Bank Name</Text>
                          <Text style={styles.bankDetailsCellValue}>{formData.bankName || 'HDFC Bank'}</Text>
                        </View>
                        <View style={styles.bankDetailsCell}>
                          <Text style={styles.bankDetailsCellLabel}>Account Number</Text>
                          <Text style={styles.bankDetailsCellValue}>
                            {formData.accountNumber ? `****${formData.accountNumber.slice(-4)}` : '****5678'}
                          </Text>
                        </View>
                        <View style={styles.bankDetailsCell}>
                          <Text style={styles.bankDetailsCellLabel}>IFSC Code</Text>
                          <Text style={styles.bankDetailsCellValue}>{formData.ifsc || 'HDFC0001234'}</Text>
                        </View>
                        {formData.branchName ? (
                          <View style={styles.bankDetailsCell}>
                            <Text style={styles.bankDetailsCellLabel}>Branch</Text>
                            <Text style={styles.bankDetailsCellValue}>{formData.branchName}</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    {/* Notes */}
                    <View style={styles.notesSection}>
                      <Text style={styles.notesLabel}>NOTES</Text>
                      <Text style={styles.notesText}>
                        Thank you for your business! Payment is due within 15 days of the invoice date.
                      </Text>
                    </View>

                    {/* Terms */}
                    <View style={styles.termsSection}>
                      <Text style={styles.termsLabel}>TERMS & CONDITIONS</Text>
                      <Text style={styles.termsText}>1. Late payments may attract interest at 2% per month.</Text>
                      <Text style={styles.termsText}>2. All disputes are subject to Vadodara jurisdiction.</Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.invoiceDocFooter}>
                      <Text style={styles.invoiceDocFooterText}>Generated via Trustopay • trustopay.com</Text>
                    </View>
                  </View>
                  <View style={styles.invoiceAccent} />
                </View>

                {/* Warning */}
                <View style={styles.previewWarning}>
                  <Ionicons name="alert-circle-outline" size={16} color={colors.amber500} style={{ marginRight: 8 }} />
                  <Text style={styles.previewWarningText}>
                    This is a sample invoice preview. Client details, line items, and bank details shown are demo data. Your actual business information from the form above is used in the "From" section.
                  </Text>
                </View>
              </ScrollView>
              <View style={styles.previewFooter}>
                <Button onPress={() => setShowFullPreview(false)} size="lg">
                  Close Preview
                </Button>
              </View>
            </View>
          </Modal>
        )}
      </View>
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
    gap: 8,
    padding: 12,
    borderRadius: 8,
    zIndex: 100,
  },
  toastSuccess: { backgroundColor: colors.green600 },
  toastError: { backgroundColor: colors.red500 },
  toastText: { color: colors.white, fontSize: 14, fontWeight: '500' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.navy, marginBottom: 16 },
  groupLabel: { fontSize: 12, fontWeight: '700', color: colors.gray400, letterSpacing: 1, marginBottom: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioActive: { borderColor: colors.purple, backgroundColor: colors.purple },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.white },
  radioText: { fontSize: 16, color: colors.navy },
  logoSection: { marginTop: 8 },
  logoToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoLabel: { fontSize: 14, fontWeight: '600', color: colors.navy },
  logoContent: { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.gray100 },
  logoPreview: { height: 80, marginBottom: 12 },
  logoActions: { flexDirection: 'row', gap: 8 },
  logoBtn: { flex: 1 },
  removeLogoBtn: { flex: 1, borderWidth: 1, borderColor: colors.red500, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  removeLogoText: { fontSize: 14, fontWeight: '600', color: colors.red500 },
  uploadArea: {
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.gray300,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purple100, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  uploadText: { fontSize: 14, fontWeight: '600', color: colors.purple },
  uploadHint: { fontSize: 12, color: colors.gray400, marginTop: 4 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationBtnText: { color: colors.purple, fontWeight: '600', marginLeft: 4 },
  collapseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.gray50,
    borderRadius: 12,
  },
  collapseTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  collapseSub: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  bankContent: { marginTop: 12, padding: 16, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200 },
  inputWithEye: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 34 },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  previewLogo: { width: 48, height: 48 },
  previewPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  previewPlaceholderText: { fontSize: 18, fontWeight: '700', color: colors.white },
  previewMeta: { alignItems: 'flex-end' },
  previewLabel: { fontSize: 12, fontWeight: '700', color: colors.gray400 },
  previewNum: { fontSize: 12, color: colors.gray400 },
  previewFrom: { fontSize: 10, fontWeight: '700', color: colors.gray400, marginBottom: 4 },
  previewName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  previewDetails: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  previewTap: { fontSize: 12, color: colors.purple, marginTop: 12 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  saveBtn: { height: 48 },
  previewModal: { flex: 1, backgroundColor: colors.gray50 },
  previewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  previewModalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  sampleBadge: { marginLeft: 'auto', backgroundColor: colors.purple50, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  sampleText: { fontSize: 10, fontWeight: '700', color: colors.purple },
  previewScroll: { flex: 1, backgroundColor: colors.gray50 },
  previewScrollContent: { padding: 20, paddingBottom: 24 },
  invoiceDoc: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.gray200, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  invoiceAccent: { height: 5, backgroundColor: colors.purple },
  invoiceBody: { padding: 24 },
  invoiceTopSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  invoiceSender: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  invoiceAvatar: { width: 48, height: 48 },
  invoiceAvatarPlaceholder: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  invoiceAvatarText: { fontSize: 20, fontWeight: '700', color: colors.white },
  invoiceSenderInfo: { flex: 1 },
  invoiceSenderName: { fontSize: 14, fontWeight: '700', color: colors.navy },
  invoiceSenderSub: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  invoiceMetaRight: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, letterSpacing: 0.5 },
  invoiceId: { fontSize: 12, color: colors.gray400, fontWeight: '500', marginTop: 2 },
  fromBillToRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  fromBillCol: { flex: 1 },
  fromBillLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.5, marginBottom: 6 },
  fromBillName: { fontSize: 12, fontWeight: '700', color: colors.navy },
  fromBillSub: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  fromBillAddr: { fontSize: 11, color: colors.gray500, marginTop: 2 },
  metaCardsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  metaCard: { flex: 1, backgroundColor: colors.gray50, borderRadius: 8, padding: 10 },
  metaCardPurple: { backgroundColor: colors.purple50 },
  metaCardLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.2 },
  metaCardLabelPurple: { color: colors.purple },
  metaCardValue: { fontSize: 12, fontWeight: '600', color: colors.navy, marginTop: 4 },
  metaCardValuePurple: { fontSize: 12, fontWeight: '700', color: colors.purple, marginTop: 4 },
  lineItemsTable: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, overflow: 'hidden', marginBottom: 24 },
  lineItemsHeader: { flexDirection: 'row', backgroundColor: colors.gray50, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray200, alignItems: 'center' },
  lineItemsHeaderText: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 0.5 },
  lineItemsItemCol: { flex: 2.5 },
  lineItemsQtyCol: { width: 36, alignItems: 'center' },
  lineItemsRateCol: { width: 72, alignItems: 'flex-end' },
  lineItemsAmtCol: { width: 72, alignItems: 'flex-end' },
  lineItemRight: { textAlign: 'right' },
  lineItemCenter: { textAlign: 'center' },
  lineItemsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100, alignItems: 'center' },
  lineItemName: { fontSize: 12, fontWeight: '600', color: colors.navy },
  lineItemDesc: { fontSize: 10, color: colors.gray400, marginTop: 2 },
  lineItemVal: { fontSize: 12, color: colors.gray600 },
  lineItemAmt: { fontSize: 12, fontWeight: '600', color: colors.navy },
  totalsSection: { alignItems: 'flex-end', marginBottom: 24 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', width: 160, marginBottom: 6 },
  totalsRowTotal: { borderTopWidth: 1, borderTopColor: colors.gray200, paddingTop: 10, marginTop: 4 },
  totalsLabel: { fontSize: 12, color: colors.gray500 },
  totalsValue: { fontSize: 12, fontWeight: '500', color: colors.navy },
  totalsLabelBold: { fontSize: 14, fontWeight: '700', color: colors.navy },
  totalsValuePurple: { fontSize: 14, fontWeight: '700', color: colors.purple },
  amountWordsBox: { backgroundColor: colors.purple50, borderRadius: 8, padding: 12, marginBottom: 24 },
  amountWordsLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.2 },
  amountWordsValue: { fontSize: 12, fontWeight: '500', color: colors.navy, marginTop: 4 },
  bankDetailsBox: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 8, padding: 16, marginBottom: 24 },
  bankDetailsLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.2, marginBottom: 8 },
  bankDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
  bankDetailsCell: { width: '50%', paddingHorizontal: 8, marginBottom: 12 },
  bankDetailsCellLabel: { fontSize: 10, color: colors.gray400 },
  bankDetailsCellValue: { fontSize: 12, fontWeight: '600', color: colors.navy, marginTop: 2 },
  notesSection: { marginBottom: 16 },
  notesLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.2, marginBottom: 4 },
  notesText: { fontSize: 11, color: colors.gray500 },
  termsSection: { marginBottom: 16 },
  termsLabel: { fontSize: 9, fontWeight: '700', color: colors.gray400, letterSpacing: 1.2, marginBottom: 4 },
  termsText: { fontSize: 11, color: colors.gray500, marginBottom: 2 },
  invoiceDocFooter: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100, alignItems: 'center' },
  invoiceDocFooterText: { fontSize: 9, color: colors.gray400 },
  previewWarning: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.orange50, borderWidth: 1, borderColor: '#FCD34D', borderRadius: 8, padding: 12, marginTop: 16 },
  previewWarningText: { flex: 1, fontSize: 11, color: colors.gray700 },
  previewFooter: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray100 },
});
