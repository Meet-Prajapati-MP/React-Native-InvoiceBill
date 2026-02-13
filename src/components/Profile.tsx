import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatINR } from '../lib/utils';
import { colors } from '../theme/colors';

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: colors.blue100, text: colors.blue600 },
  green: { bg: colors.green100, text: colors.green600 },
  purple: { bg: colors.purple100, text: colors.purple },
  orange: { bg: colors.orange50, text: '#EA580C' },
  teal: { bg: '#CCFBF1', text: '#0D9488' },
  pink: { bg: '#FCE7F3', text: '#DB2777' },
  indigo: { bg: '#E0E7FF', text: '#4F46E5' },
  red: { bg: colors.red50, text: colors.red500 },
  yellow: { bg: '#FEF9C3', text: '#CA8A04' },
  cyan: { bg: '#CFFAFE', text: '#0891B2' },
};

interface CustomerProfileProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
  onSendMoney: () => void;
  onCreateInvoice: () => void;
  onSelectTransaction: (tx: any) => void;
  onSelectInvoice?: (invoice: any) => void;
}

interface ChatMessage {
  id: string;
  type: 'payment' | 'invoice' | 'message' | 'attachment';
  direction: 'in' | 'out';
  text?: string;
  amount?: number;
  date: string;
  status?: string;
  invoiceRef?: string;
  milestone?: string;
  note?: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export function CustomerProfile({
  isOpen,
  onClose,
  customer,
  onSendMoney,
  onCreateInvoice,
  onSelectTransaction,
  onSelectInvoice,
}: CustomerProfileProps) {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showAttachment, setShowAttachment] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const customerUpi = customer ? `${customer.name?.split(' ')[0]?.toLowerCase()}@trustopay` : '';
  const customerInvoices = customer?.name === 'Priya Sharma'
    ? [
        { id: 'INV-006', amount: 15000, date: 'Oct 10, 2023', status: 'partial', note: 'Website Design Project', direction: 'out' as const },
        { id: 'INV-012', amount: 8000, date: 'Sep 5, 2023', status: 'paid', note: 'UI Consultation', direction: 'out' as const },
      ]
    : [
        { id: 'INV-007', amount: 2500, date: 'Oct 20, 2023', status: 'paid', note: 'Logo Design', direction: 'in' as const },
        { id: 'INV-015', amount: 4500, date: 'Aug 12, 2023', status: 'paid', note: 'Brand Kit', direction: 'in' as const },
      ];

  const chatHistory: ChatMessage[] = customer?.name === 'Priya Sharma'
    ? [
        { id: '1', type: 'invoice', direction: 'out', amount: 15000, date: 'Oct 10, 9:30 AM', status: 'Sent', invoiceRef: 'INV-006', note: 'Website Design Project' },
        { id: '2', type: 'payment', direction: 'in', amount: 5000, date: 'Oct 15, 2:15 PM', status: 'Completed', invoiceRef: 'INV-006', milestone: 'Milestone 1 of 3', note: 'First milestone payment' },
        { id: '3', type: 'message', direction: 'in', text: 'First milestone done, starting phase 2 now.', date: 'Oct 16, 10:00 AM' },
        { id: '6', type: 'attachment', direction: 'in', text: 'design-mockup-v2.png', date: 'Oct 18, 3:00 PM', attachmentUrl: 'https://via.placeholder.com/300x200', attachmentName: 'design-mockup-v2.png' },
        { id: '4', type: 'payment', direction: 'in', amount: 5000, date: 'Oct 24, 10:23 AM', status: 'Completed', invoiceRef: 'INV-006', milestone: 'Milestone 2 of 3', note: 'Second milestone payment' },
        { id: '5', type: 'message', direction: 'out', text: 'Thanks! Final delivery next week.', date: 'Oct 24, 10:45 AM' },
      ]
    : [
        { id: '1', type: 'invoice', direction: 'in', amount: 2500, date: 'Oct 20, 11:00 AM', status: 'Received', invoiceRef: 'INV-007', note: 'Logo Design' },
        { id: '2', type: 'payment', direction: 'out', amount: 2500, date: 'Oct 21, 4:45 PM', status: 'Completed', invoiceRef: 'INV-007', note: 'Full Payment' },
        { id: '3', type: 'message', direction: 'in', text: 'Payment received, thanks!', date: 'Oct 21, 5:00 PM' },
        { id: '4', type: 'attachment', direction: 'in', text: 'final-logo.png', date: 'Oct 22, 9:00 AM', attachmentUrl: 'https://via.placeholder.com/300x200', attachmentName: 'final-logo.png' },
      ];

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [isOpen]);

  const handleCall = () => {
    setShowCallAlert(true);
    setTimeout(() => setShowCallAlert(false), 2000);
  };

  const handleCopyUpi = () => {
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleOpenProfile = () => {
    setShowProfileDetails(true);
    setShowMenu(false);
  };

  const handleOpenInvoices = () => {
    setShowInvoiceList(true);
    setShowMenu(false);
  };

  if (!customer) return null;

  const c = colorMap[customer.color] || colorMap.blue;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.navy} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleOpenProfile} style={styles.profilePreview} activeOpacity={0.7}>
              <View style={[styles.headerAvatar, { backgroundColor: c.bg }]}>
                <Text style={[styles.headerAvatarText, { color: c.text }]}>{customer.initials}</Text>
              </View>
              <View>
                <Text style={styles.headerName}>{customer.name}</Text>
                <Text style={styles.headerPhone}>{customer.phone}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleCall} style={styles.iconBtn}>
              <Ionicons name="call" size={20} color={colors.gray500} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.iconBtn}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.gray500} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu Dropdown */}
        {showMenu && (
          <>
            <TouchableOpacity style={styles.menuBackdrop} onPress={() => setShowMenu(false)} activeOpacity={1} />
            <View style={styles.menuDropdown}>
              <TouchableOpacity style={styles.menuItem} onPress={handleOpenProfile}>
                <Ionicons name="person-outline" size={18} color={colors.gray700} />
                <Text style={styles.menuText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleOpenInvoices}>
                <Ionicons name="document-text-outline" size={18} color={colors.gray700} />
                <Text style={styles.menuText}>All Invoices</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="warning-outline" size={18} color={colors.amber500} />
                <Text style={[styles.menuText, { color: colors.amber500 }]}>Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="ban-outline" size={18} color={colors.red500} />
                <Text style={[styles.menuText, { color: colors.red500 }]}>Block User</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Call Alert */}
        {showCallAlert && (
          <View style={styles.callAlert}>
            <Ionicons name="call" size={14} color={colors.white} />
            <Text style={styles.callAlertText}>Calling {customer.name}...</Text>
          </View>
        )}

        {/* Full Profile Overlay */}
        {showProfileDetails && (
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <TouchableOpacity onPress={() => setShowProfileDetails(false)} style={styles.headerBtn}>
                  <Ionicons name="arrow-back" size={24} color={colors.navy} />
                </TouchableOpacity>
                <Text style={styles.overlayTitle}>Profile</Text>
              </View>
              <ScrollView style={styles.overlayScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                  <View style={[styles.profileAvatar, { backgroundColor: c.bg }]}>
                    <Text style={[styles.profileAvatarText, { color: c.text }]}>{customer.initials}</Text>
                  </View>
                  <Text style={styles.profileName}>{customer.name}</Text>
                  <Text style={styles.profilePhone}>{customer.phone}</Text>
                </View>
                <View style={styles.profileBody}>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <View style={styles.infoIconWrap}>
                        <Ionicons name="globe-outline" size={16} color={colors.purple} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>UPI ID</Text>
                        <Text style={styles.infoValue}>{customerUpi}</Text>
                      </View>
                      <TouchableOpacity onPress={handleCopyUpi} style={styles.copyBtn}>
                        {copiedUpi ? (
                          <Ionicons name="checkmark-circle" size={18} color={colors.green600} />
                        ) : (
                          <Ionicons name="copy-outline" size={18} color={colors.gray400} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconWrap, { backgroundColor: colors.blue100 }]}>
                        <Ionicons name="call-outline" size={16} color={colors.blue600} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>Phone</Text>
                        <Text style={styles.infoValue}>{customer.phone}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                      <View style={[styles.infoIconWrap, { backgroundColor: colors.green100 }]}>
                        <Ionicons name="mail-outline" size={16} color={colors.green600} />
                      </View>
                      <View style={styles.infoTextWrap}>
                        <Text style={styles.infoLabel}>Email</Text>
                        <Text style={styles.infoValue}>{customer.name?.split(' ')[0]?.toLowerCase()}@example.com</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Total Paid</Text>
                      <Text style={styles.statValue}>₹25k</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.green50 }]}>
                      <Text style={styles.statLabel}>Received</Text>
                      <Text style={[styles.statValue, { color: colors.green600 }]}>₹12k</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: colors.purple50 }]}>
                      <Text style={styles.statLabel}>Invoices</Text>
                      <Text style={[styles.statValue, { color: colors.purple }]}>{customerInvoices.length}</Text>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.reportBtn}>
                      <Ionicons name="warning-outline" size={16} color={colors.amber500} />
                      <Text style={styles.reportBtnText}>Report</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.blockBtn}>
                      <Ionicons name="ban-outline" size={16} color={colors.red500} />
                      <Text style={styles.blockBtnText}>Block</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Invoice List Overlay */}
        {showInvoiceList && (
          <View style={styles.overlay} pointerEvents="box-none">
            <View style={styles.overlayContent}>
              <View style={styles.overlayHeader}>
                <TouchableOpacity onPress={() => setShowInvoiceList(false)} style={styles.headerBtn}>
                  <Ionicons name="arrow-back" size={24} color={colors.navy} />
                </TouchableOpacity>
                <Text style={styles.overlayTitle}>Invoices with {customer.name?.split(' ')[0]}</Text>
              </View>
              <ScrollView style={styles.overlayScroll} contentContainerStyle={styles.invoiceListContent}>
                {customerInvoices.map((inv) => (
                  <TouchableOpacity
                    key={inv.id}
                    onPress={() => {
                      setShowInvoiceList(false);
                      if (onSelectInvoice) {
                        onSelectInvoice({ number: inv.id, client: customer.name, amount: inv.amount, date: inv.date });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Card style={styles.invoiceCard}>
                      <View style={styles.invoiceRow}>
                        <View style={[styles.invoiceIconWrap, inv.direction === 'out' ? { backgroundColor: colors.purple50 } : { backgroundColor: colors.blue50 }]}>
                          <Ionicons
                            name="document-text"
                            size={18}
                            color={inv.direction === 'out' ? colors.purple : colors.blue600}
                          />
                        </View>
                        <View style={styles.invoiceInfo}>
                          <Text style={styles.invoiceNote}>{inv.note}</Text>
                          <Text style={styles.invoiceMeta}>#{inv.id} • {inv.date}</Text>
                        </View>
                        <View style={styles.invoiceRight}>
                          <Text style={styles.invoiceAmount}>{formatINR(inv.amount)}</Text>
                          <Text style={[styles.invoiceStatus, inv.status === 'paid' ? styles.statusPaid : styles.statusPartial]}>{inv.status}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={colors.gray300} />
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
                {customerInvoices.length === 0 && (
                  <Text style={styles.emptyInvoices}>No invoices found</Text>
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Attachment Viewer */}
        {showAttachment && (
          <TouchableOpacity style={styles.attachmentOverlay} activeOpacity={1} onPress={() => setShowAttachment(null)}>
            <View style={styles.attachmentContent}>
              <TouchableOpacity style={styles.attachClose} onPress={() => setShowAttachment(null)}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
              <Image source={{ uri: showAttachment }} style={styles.attachImage} resizeMode="contain" />
              <Button variant="outline" style={styles.downloadBtn}>
                <Ionicons name="download-outline" size={16} color={colors.white} />
                <Text style={styles.downloadText}> Download</Text>
              </Button>
            </View>
          </TouchableOpacity>
        )}

        {/* Chat Timeline */}
        <ScrollView ref={scrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
          <Text style={styles.dateLabel}>Oct 10, 2023</Text>
          {chatHistory.map((item) => (
            <View key={item.id} style={[styles.chatBubbleWrap, item.direction === 'out' && styles.chatBubbleRight]}>
              {item.type === 'message' ? (
                <View style={[styles.messageBubble, item.direction === 'out' ? styles.messageOut : styles.messageIn]}>
                  <Text style={[styles.messageText, item.direction === 'out' && styles.messageTextOut]}>{item.text}</Text>
                  <Text style={[styles.messageTime, item.direction === 'out' ? styles.messageTimeOut : styles.messageTimeIn]}>{item.date.split(',')[1]}</Text>
                </View>
              ) : item.type === 'attachment' ? (
                <TouchableOpacity
                  style={[styles.attachBubble, item.direction === 'out' && styles.attachBubbleRight]}
                  onPress={() => item.attachmentUrl && setShowAttachment(item.attachmentUrl)}
                >
                  <Image source={{ uri: item.attachmentUrl }} style={styles.attachThumb} />
                  <View style={[styles.attachCaption, item.direction === 'out' ? styles.attachCaptionOut : styles.attachCaptionIn]}>
                    <Ionicons name="image-outline" size={14} color={colors.gray400} />
                    <Text style={styles.attachName} numberOfLines={1}>{item.attachmentName}</Text>
                    <Text style={styles.attachTime}>{item.date.split(',')[1]}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.type === 'payment') {
                      onSelectTransaction({
                        id: item.id,
                        name: customer.name,
                        amount: item.amount,
                        date: item.date,
                        type: item.direction === 'in' ? 'received' : 'sent',
                        status: 'completed',
                        invoiceRef: item.invoiceRef,
                        milestone: item.milestone ? { current: 2, total: 3 } : undefined,
                        note: item.note,
                      });
                    } else if (item.type === 'invoice' && onSelectInvoice && item.invoiceRef) {
                      const inv = customerInvoices.find((i) => i.id === item.invoiceRef);
                      if (inv) onSelectInvoice({ number: inv.id, client: customer.name, amount: inv.amount, date: inv.date });
                    }
                  }}
                >
                  <View style={[styles.paymentCard, item.type === 'invoice' && styles.cardPurpleTop, item.type === 'payment' && item.direction === 'in' && styles.cardGreenTop, item.type === 'payment' && item.direction === 'out' && styles.cardRedTop]}>
                    <View style={styles.paymentHeader}>
                      <View style={[styles.paymentIconWrap, item.type === 'invoice' ? { backgroundColor: colors.purple100 } : item.direction === 'in' ? { backgroundColor: colors.green100 } : { backgroundColor: colors.red50 }]}>
                        {item.type === 'invoice' ? (
                          <Ionicons name="document-text" size={12} color={colors.purple} />
                        ) : item.direction === 'in' ? (
                          <Ionicons name="arrow-down" size={12} color={colors.green600} />
                        ) : (
                          <Ionicons name="arrow-up" size={12} color={colors.red500} />
                        )}
                      </View>
                      <Text style={[styles.paymentType, item.type === 'invoice' ? { color: colors.purple } : item.direction === 'in' ? { color: colors.green600 } : { color: colors.red500 }]}>
                        {item.type === 'payment' ? (item.direction === 'out' ? 'Payment Sent' : 'Payment Received') : item.direction === 'out' ? 'Invoice Sent' : 'Invoice Received'}
                      </Text>
                      {item.type === 'payment' && (
                        <View style={styles.doneBadge}>
                          <Ionicons name="checkmark-circle" size={10} color={colors.green600} />
                          <Text style={styles.doneText}>Done</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentAmount}>{formatINR(item.amount || 0)}</Text>
                    <Text style={styles.paymentNote}>{item.note}</Text>
                    {item.invoiceRef && (
                      <Text style={styles.paymentRef}>
                        <Ionicons name="document-text-outline" size={10} /> #{item.invoiceRef}
                      </Text>
                    )}
                    {item.milestone && (
                      <View style={styles.milestoneBlock}>
                        <Text style={styles.milestoneText}>{item.milestone}</Text>
                        <View style={styles.milestoneDots}>
                          {[1, 2, 3].map((_, i) => (
                            <View key={i} style={[styles.milestoneDot, i < 2 ? styles.milestoneDotDone : styles.milestoneDotPending]} />
                          ))}
                        </View>
                      </View>
                    )}
                    <Text style={styles.paymentTime}>{item.date.split(',')[1]}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Action Bar */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={onSendMoney} style={styles.actionBtn}>
              <Ionicons name="send" size={20} color={colors.purple} />
              <Text style={styles.actionLabel}>Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCreateInvoice} style={styles.actionBtn}>
              <Ionicons name="document-text" size={20} color={colors.purple} />
              <Text style={styles.actionLabel}>Invoice</Text>
            </TouchableOpacity>
            <View style={styles.messageWrap}>
              <TextInput
                placeholder="Message..."
                placeholderTextColor={colors.gray400}
                value={message}
                onChangeText={setMessage}
                style={styles.messageInput}
              />
              <View style={styles.messageActions}>
                <TouchableOpacity style={styles.msgIconBtn}>
                  <Ionicons name="attach" size={18} color={colors.gray400} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sendBtn}>
                  <Ionicons name="send" size={14} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  headerBtn: { padding: 8, marginLeft: -8 },
  profilePreview: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 14, fontWeight: '700' },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.navy },
  headerPhone: { fontSize: 12, color: colors.gray500 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 8 },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
  },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'android' ? 100 : 108,
    width: 180,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
    paddingVertical: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  menuText: { fontSize: 14, color: colors.gray700 },
  menuDivider: { height: 1, backgroundColor: colors.gray100, marginVertical: 4 },
  callAlert: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 100 : 108,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    zIndex: 50,
  },
  callAlertText: { fontSize: 14, color: colors.white },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    zIndex: 30,
  },
  overlayContent: { flex: 1 },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  overlayTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  overlayScroll: { flex: 1 },
  profileHeader: {
    backgroundColor: colors.purple50,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  profileAvatarText: { fontSize: 28, fontWeight: '700' },
  profileName: { fontSize: 24, fontWeight: '700', color: colors.navy },
  profilePhone: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  profileBody: { padding: 20, paddingBottom: 32 },
  infoCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.purple100, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: colors.gray400, letterSpacing: 1 },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.navy },
  copyBtn: { padding: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: colors.gray50, padding: 12, borderRadius: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, color: colors.gray500, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.navy },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: colors.orange50, borderRadius: 12 },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: colors.amber500 },
  blockBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, backgroundColor: colors.red50, borderRadius: 12 },
  blockBtnText: { fontSize: 14, fontWeight: '600', color: colors.red500 },
  invoiceListContent: { padding: 20 },
  invoiceCard: { marginBottom: 12, padding: 16 },
  invoiceRow: { flexDirection: 'row', alignItems: 'center' },
  invoiceIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  invoiceInfo: { flex: 1 },
  invoiceNote: { fontSize: 14, fontWeight: '700', color: colors.navy },
  invoiceMeta: { fontSize: 12, color: colors.gray400 },
  invoiceRight: { alignItems: 'flex-end', marginRight: 8 },
  invoiceAmount: { fontSize: 14, fontWeight: '700', color: colors.navy },
  invoiceStatus: { fontSize: 10, fontWeight: '600' },
  statusPaid: { color: colors.green600 },
  statusPartial: { color: colors.amber500 },
  emptyInvoices: { textAlign: 'center', paddingVertical: 48, color: colors.gray400 },
  attachmentOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    zIndex: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentContent: { alignItems: 'center', padding: 24 },
  attachClose: { position: 'absolute', top: 56, right: 24, padding: 8 },
  attachImage: { width: width - 48, height: 300 },
  downloadBtn: { marginTop: 24, borderColor: 'rgba(255,255,255,0.3)', flexDirection: 'row', alignItems: 'center' },
  downloadText: { color: colors.white },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  dateLabel: { textAlign: 'center', fontSize: 12, color: colors.gray400, marginBottom: 16 },
  chatBubbleWrap: { marginBottom: 16 },
  chatBubbleRight: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  messageOut: { backgroundColor: colors.purple, borderBottomRightRadius: 4 },
  messageIn: { backgroundColor: colors.gray100, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 14, color: colors.navy },
  messageTextOut: { color: colors.white },
  messageTime: { fontSize: 10, marginTop: 4 },
  messageTimeOut: { color: colors.purpleLight },
  messageTimeIn: { color: colors.gray400 },
  attachBubble: { maxWidth: '75%', borderRadius: 16, overflow: 'hidden', borderBottomLeftRadius: 4 },
  attachBubbleRight: { alignSelf: 'flex-end', borderBottomLeftRadius: 16, borderBottomRightRadius: 4 },
  attachThumb: { width: 200, height: 160 },
  attachCaption: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  attachCaptionOut: { backgroundColor: colors.purple50 },
  attachCaptionIn: { backgroundColor: colors.gray100 },
  attachName: { flex: 1, fontSize: 12, color: colors.gray600 },
  attachTime: { fontSize: 10, color: colors.gray400 },
  paymentCard: {
    maxWidth: '85%',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  cardPurpleTop: { borderTopWidth: 4, borderTopColor: colors.purple },
  cardGreenTop: { borderTopWidth: 4, borderTopColor: colors.green600 },
  cardRedTop: { borderTopWidth: 4, borderTopColor: colors.red500 },
  paymentHeader: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  paymentIconWrap: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  paymentType: { fontSize: 12, fontWeight: '600' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  doneText: { fontSize: 10, fontWeight: '600', color: colors.green600 },
  paymentAmount: { fontSize: 24, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  paymentNote: { fontSize: 12, fontWeight: '500', color: colors.gray600, marginBottom: 4 },
  paymentRef: { fontSize: 10, color: colors.gray400, marginBottom: 4 },
  milestoneBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray100 },
  milestoneText: { fontSize: 10, fontWeight: '500', color: colors.gray500, marginBottom: 8 },
  milestoneDots: { flexDirection: 'row', gap: 4 },
  milestoneDot: { flex: 1, height: 6, borderRadius: 3 },
  milestoneDotDone: { backgroundColor: colors.green600 },
  milestoneDotPending: { backgroundColor: colors.gray100 },
  paymentTime: { fontSize: 10, color: colors.gray400, textAlign: 'right', marginTop: 8 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 10, fontWeight: '500', color: colors.navy, marginTop: 4 },
  messageWrap: { flex: 1, position: 'relative' },
  messageInput: {
    height: 48,
    backgroundColor: colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 80,
    fontSize: 14,
    color: colors.navy,
  },
  messageActions: { position: 'absolute', right: 8, top: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  msgIconBtn: { padding: 8 },
  sendBtn: {
    width: 32,
    height: 32,
    backgroundColor: colors.purple,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
