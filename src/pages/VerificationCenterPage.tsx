import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

interface VerificationCenterPageProps {
  isOpen: boolean;
  onClose: () => void;
}

type VerificationStatus = 'verified' | 'pending' | 'not_added' | 'failed';

interface VerificationState {
  mobile: VerificationStatus;
  email: VerificationStatus;
  pan: VerificationStatus;
  gstin: VerificationStatus;
  bank: VerificationStatus;
}

const INITIAL_STATE: VerificationState = {
  mobile: 'verified',
  email: 'verified',
  pan: 'pending',
  gstin: 'not_added',
  bank: 'verified',
};

function VerificationCard({
  icon,
  title,
  status,
  value,
  subValue,
  date,
  description,
  actionLabel,
  onAction,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  status: VerificationStatus;
  value?: string;
  subValue?: string;
  date?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const statusConfig: Record<VerificationStatus, { color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
    verified: { color: colors.green600, bg: colors.green50, border: colors.green600 + '40', icon: 'checkmark-circle-outline', label: 'Verified' },
    pending: { color: '#D97706', bg: '#FEF3C7', border: '#FCD34D', icon: 'time-outline', label: 'Pending' },
    not_added: { color: colors.red500, bg: colors.red50, border: colors.red500 + '60', icon: 'close-circle-outline', label: 'Not Added' },
    failed: { color: colors.red500, bg: colors.red50, border: colors.red500 + '60', icon: 'alert-circle-outline', label: 'Failed' },
  };
  const config = statusConfig[status];
  const cardBg = status === 'verified' ? colors.white : config.bg;
  const borderColor = status === 'verified' ? colors.green600 + '40' : config.border;

  return (
    <Card style={[styles.verificationCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Ionicons name={icon} size={18} color={colors.gray500} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        {value && <Text style={styles.cardValue}>{value}</Text>}
        {subValue && <Text style={styles.cardSubValue}>{subValue}</Text>}
        {description && <Text style={styles.cardDesc}>{description}</Text>}
        {date && <Text style={styles.cardDate}>Verified on: {date}</Text>}
        {actionLabel && onAction && (
          <Button variant="outline" size="sm" onPress={onAction} style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>{actionLabel}</Text>
          </Button>
        )}
      </View>
    </Card>
  );
}

export function VerificationCenterPage({ isOpen, onClose }: VerificationCenterPageProps) {
  const [verifications, setVerifications] = useState<VerificationState>(INITIAL_STATE);
  const [activeFlow, setActiveFlow] = useState<'pan' | 'gstin' | 'bank' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showBenefits, setShowBenefits] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [panName, setPanName] = useState('Ankit Shah');
  const [gstinNumber, setGstinNumber] = useState('');
  const [bankHolder, setBankHolder] = useState('Ankit Shah');
  const [bankAccount, setBankAccount] = useState('');
  const [bankConfirm, setBankConfirm] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [showAccount, setShowAccount] = useState(false);

  const totalSteps = 5;
  const completedSteps = Object.values(verifications).filter((v) => v === 'verified').length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const showSuccess = (msg: string) => {
    setShowToast({ type: 'success', message: msg });
    setTimeout(() => setShowToast(null), 3000);
  };
  const showError = (msg: string) => {
    setShowToast({ type: 'error', message: msg });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handlePanSubmit = () => {
    if (panNumber.replace(/\s/g, '').length !== 10) {
      showError('Invalid PAN format');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications((p) => ({ ...p, pan: 'verified' }));
      showSuccess('PAN Verified Successfully!');
      setActiveFlow(null);
      setPanNumber('');
      setPanName('Ankit Shah');
    }, 2000);
  };

  const handleGstinSubmit = () => {
    if (gstinNumber.replace(/\s/g, '').length !== 15) {
      showError('Invalid GSTIN format');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications((p) => ({ ...p, gstin: 'verified' }));
      showSuccess('GSTIN Verified Successfully!');
      setActiveFlow(null);
      setGstinNumber('');
    }, 2000);
  };

  const handleBankSubmit = () => {
    if (bankAccount !== bankConfirm) {
      showError('Account numbers do not match');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setVerifications((p) => ({ ...p, bank: 'verified' }));
      showSuccess('Account Verified Successfully!');
      setActiveFlow(null);
      setBankAccount('');
      setBankConfirm('');
      setBankIfsc('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification Center</Text>
          <TouchableOpacity onPress={() => setShowBenefits(true)}>
            <Text style={styles.whyLink}>Why Verify?</Text>
          </TouchableOpacity>
        </View>

        {showToast && (
          <View style={[styles.toast, showToast.type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Ionicons name={showToast.type === 'success' ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={18} color={colors.white} />
            <Text style={styles.toastText}>{showToast.message}</Text>
          </View>
        )}

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Your Verification Status</Text>
              <Text style={styles.progressPct}>{progressPercentage}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <Text style={styles.progressSub}>{completedSteps} of {totalSteps} verifications complete</Text>
            <Text style={styles.progressCta}>Complete all to unlock premium features!</Text>
          </Card>

          <VerificationCard
            icon="phone-portrait-outline"
            title="Mobile Number"
            status={verifications.mobile}
            value="+91 98765 43210"
            date="Feb 5, 2026"
          />
          <VerificationCard
            icon="mail-outline"
            title="Email Address"
            status={verifications.email}
            value="ankit@trustopay.com"
            date="Feb 5, 2026"
          />
          <VerificationCard
            icon="card-outline"
            title="PAN Card"
            status={verifications.pan}
            description="Verify your identity for secure transactions"
            actionLabel="Upload PAN Card"
            onAction={() => setActiveFlow('pan')}
          />
          <VerificationCard
            icon="business-outline"
            title="GSTIN"
            status={verifications.gstin}
            description="For GST-registered businesses (Optional)"
            actionLabel="Add GSTIN"
            onAction={() => setActiveFlow('gstin')}
          />
          <VerificationCard
            icon="wallet-outline"
            title="Bank Account"
            status={verifications.bank}
            value="XXXX XXXX XXXX 1234"
            subValue="State Bank of India"
            date="Feb 8, 2026"
            actionLabel={verifications.bank !== 'verified' ? 'Verify Bank Account' : undefined}
            onAction={verifications.bank !== 'verified' ? () => setActiveFlow('bank') : undefined}
          />
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      {/* PAN Flow */}
      {activeFlow === 'pan' && (
        <Modal visible animationType="slide">
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <TouchableOpacity onPress={() => setActiveFlow(null)}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.flowTitle}>PAN Verification</Text>
            </View>
            <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowContent}>
              <Input label="Enter PAN Number *" placeholder="ABCDE1234F" value={panNumber} onChangeText={(t) => setPanNumber(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
              <Text style={styles.flowHint}>Format: AAAAA9999A</Text>
              <Input label="Name on PAN Card *" value={panName} onChangeText={setPanName} />
              <Text style={styles.flowHint}>Must match your registered name</Text>
              <Text style={styles.uploadLabel}>Upload PAN Card Image *</Text>
              <TouchableOpacity style={styles.uploadZone}>
                <Ionicons name="cloud-upload-outline" size={24} color={colors.purple} />
                <Text style={styles.uploadText}>Upload Front Side</Text>
                <Text style={styles.uploadSub}>Max 5MB • JPG, PNG, PDF</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.flowFooter}>
              <Button onPress={handlePanSubmit} disabled={isSubmitting || !panNumber || !panName}>
                {isSubmitting ? 'Verifying...' : 'Submit for Verification'}
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {/* GSTIN Flow */}
      {activeFlow === 'gstin' && (
        <Modal visible animationType="slide">
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <TouchableOpacity onPress={() => setActiveFlow(null)}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.flowTitle}>GSTIN Verification</Text>
            </View>
            <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowContent}>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={colors.blue600} />
                <View>
                  <Text style={styles.infoTitle}>GSTIN is optional</Text>
                  <Text style={styles.infoText}>Only required if you are GST registered. Skip if you're not.</Text>
                </View>
              </View>
              <Input label="GSTIN Number *" placeholder="24ABCDE1234F1Z5" value={gstinNumber} onChangeText={(t) => setGstinNumber(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15))} />
              <Text style={styles.flowHint}>Format: 15 characters</Text>
            </ScrollView>
            <View style={styles.flowFooterRow}>
              <Button variant="outline" onPress={() => setActiveFlow(null)} style={styles.flowFooterBtn}>Skip</Button>
              <Button onPress={handleGstinSubmit} disabled={isSubmitting || !gstinNumber} style={[styles.flowFooterBtn, { flex: 2 }]}>
                {isSubmitting ? 'Verifying...' : 'Verify GSTIN'}
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {/* Bank Flow */}
      {activeFlow === 'bank' && (
        <Modal visible animationType="slide">
          <View style={styles.flowContainer}>
            <View style={styles.flowHeader}>
              <TouchableOpacity onPress={() => setActiveFlow(null)}>
                <Ionicons name="arrow-back" size={24} color={colors.navy} />
              </TouchableOpacity>
              <Text style={styles.flowTitle}>Bank Verification</Text>
            </View>
            <ScrollView style={styles.flowScroll} contentContainerStyle={styles.flowContent}>
              <Card style={styles.bankBenefitsCard}>
                <Text style={styles.bankBenefitsTitle}>Why verify your bank account?</Text>
                {['Receive payments directly', 'Enable invoice financing', 'Faster withdrawals', 'Show on invoices'].map((item, i) => (
                  <View key={i} style={styles.bankBenefitRow}>
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.green600} />
                    <Text style={styles.bankBenefitText}>{item}</Text>
                  </View>
                ))}
              </Card>
              <Input label="Account Holder Name *" value={bankHolder} onChangeText={setBankHolder} />
              <View style={styles.inputWithIcon}>
                <Input label="Account Number *" value={bankAccount} onChangeText={(t) => setBankAccount(t.replace(/\D/g, ''))} secureTextEntry={!showAccount} keyboardType="numeric" />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowAccount(!showAccount)}>
                  <Ionicons name={showAccount ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray500} />
                </TouchableOpacity>
              </View>
              <Input label="Confirm Account Number *" value={bankConfirm} onChangeText={(t) => setBankConfirm(t.replace(/\D/g, ''))} keyboardType="numeric" />
              <Input label="IFSC Code *" placeholder="SBIN0001234" value={bankIfsc} onChangeText={(t) => setBankIfsc(t.toUpperCase().slice(0, 11))} />
            </ScrollView>
            <View style={styles.flowFooter}>
              <Button onPress={handleBankSubmit} disabled={isSubmitting || !bankAccount || !bankIfsc}>
                {isSubmitting ? 'Verifying...' : 'Verify Account'}
              </Button>
            </View>
          </View>
        </Modal>
      )}

      {/* Benefits Modal */}
      <Modal visible={showBenefits} transparent animationType="fade">
        <TouchableOpacity style={styles.benefitsOverlay} activeOpacity={1} onPress={() => setShowBenefits(false)}>
          <View style={styles.benefitsModal} onStartShouldSetResponder={() => true}>
            <View style={styles.benefitsHeader}>
              <Text style={styles.benefitsTitle}>Benefits of Verification</Text>
              <TouchableOpacity onPress={() => setShowBenefits(false)}>
                <Ionicons name="close-outline" size={24} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.benefitsBody}>
              {[
                { icon: '🎯', title: 'Invoice Financing', desc: 'Get paid instantly for pending invoices' },
                { icon: '💰', title: 'Higher Limits', desc: 'Process unlimited invoice amounts' },
                { icon: '⚡', title: 'Priority Support', desc: 'Faster response times for queries' },
                { icon: '🏆', title: 'Verified Badge', desc: 'Build trust with your clients' },
                { icon: '🔒', title: 'Enhanced Security', desc: 'Additional fraud protection' },
              ].map((item, i) => (
                <View key={i} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.benefitTitle}>{item.title}</Text>
                    <Text style={styles.benefitDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={styles.benefitsFooter}>
              <Button onPress={() => setShowBenefits(false)}>Start Verification</Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  whyLink: { fontSize: 12, fontWeight: '600', color: colors.purple },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  toastSuccess: { backgroundColor: colors.green600 },
  toastError: { backgroundColor: colors.red500 },
  toastText: { fontSize: 14, fontWeight: '500', color: colors.white, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  progressCard: { marginBottom: 16, backgroundColor: colors.purple50, borderColor: colors.purple + '40' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
  progressTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  progressPct: { fontSize: 24, fontWeight: '700', color: colors.purple },
  progressBarBg: { height: 8, backgroundColor: colors.purple + '30', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', backgroundColor: colors.purple, borderRadius: 4 },
  progressSub: { fontSize: 12, color: colors.gray600 },
  progressCta: { fontSize: 12, fontWeight: '600', color: colors.purple, marginTop: 4 },
  verificationCard: { marginBottom: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBody: { paddingLeft: 26 },
  cardValue: { fontSize: 14, fontWeight: '600', color: colors.navy },
  cardSubValue: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  cardDesc: { fontSize: 12, color: colors.gray500, marginTop: 2, lineHeight: 18 },
  cardDate: { fontSize: 10, color: colors.gray400, marginTop: 4 },
  actionBtn: { marginTop: 12, borderColor: colors.purple },
  actionBtnText: { color: colors.purple, fontWeight: '600', fontSize: 12 },
  flowContainer: { flex: 1, backgroundColor: colors.white },
  flowHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: Platform.OS === 'android' ? 48 : 56, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  flowTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 12 },
  flowScroll: { flex: 1 },
  flowContent: { padding: 16 },
  flowHint: { fontSize: 12, color: colors.gray500, marginTop: -8, marginBottom: 16 },
  uploadLabel: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 8 },
  uploadZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: colors.gray300, borderRadius: 12, padding: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  uploadText: { fontSize: 14, fontWeight: '600', color: colors.navy, marginTop: 12 },
  uploadSub: { fontSize: 12, color: colors.gray400, marginTop: 4 },
  flowFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.gray100 },
  flowFooterRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.gray100, gap: 12 },
  flowFooterBtn: { flex: 1 },
  infoBox: { flexDirection: 'row', backgroundColor: colors.blue50, padding: 16, borderRadius: 12, marginBottom: 16, gap: 12 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.blue600 },
  infoText: { fontSize: 12, color: colors.blue600, marginTop: 4 },
  bankBenefitsCard: { backgroundColor: colors.green50, borderColor: colors.green600 + '40', marginBottom: 16 },
  bankBenefitsTitle: { fontSize: 14, fontWeight: '700', color: colors.green600, marginBottom: 8 },
  bankBenefitRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  bankBenefitText: { fontSize: 12, color: colors.green600 },
  inputWithIcon: { position: 'relative' },
  eyeBtn: { position: 'absolute', right: 12, top: 38 },
  benefitsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  benefitsModal: { backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden' },
  benefitsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  benefitsTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  benefitsBody: { padding: 20, maxHeight: 360 },
  benefitRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  benefitIcon: { fontSize: 24 },
  benefitTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  benefitDesc: { fontSize: 12, color: colors.gray500, marginTop: 2 },
  benefitsFooter: { padding: 20, borderTopWidth: 1, borderTopColor: colors.gray100 },
});
