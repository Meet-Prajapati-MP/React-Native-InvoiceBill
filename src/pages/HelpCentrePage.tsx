import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

interface HelpCentrePageProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_TOPICS = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'How to create your first invoice',
    icon: 'rocket-outline' as const,
    iconColor: colors.red500,
  },
  {
    id: '2',
    title: 'Payments & Wallet',
    description: 'Add money, withdraw, and payment issues',
    icon: 'wallet-outline' as const,
    iconColor: '#D4A017',
  },
  {
    id: '3',
    title: 'Invoice Management',
    description: 'Edit, delete, and resend invoices',
    icon: 'document-text-outline' as const,
    iconColor: colors.purple,
  },
  {
    id: '4',
    title: 'GST & Tax',
    description: 'Setting up GST and tax calculations',
    icon: 'receipt-outline' as const,
    iconColor: colors.gray500,
  },
  {
    id: '5',
    title: 'Subscription & Billing',
    description: 'Plan details, upgrades, and cancellation',
    icon: 'star-outline' as const,
    iconColor: '#D4A017',
  },
  {
    id: '6',
    title: 'Account & Security',
    description: 'Profile, password, and privacy settings',
    icon: 'lock-closed-outline' as const,
    iconColor: '#F97316',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'chat',
    title: 'Chat with us',
    subtitle: 'Usually replies within 5 mins',
    icon: 'chatbubble-outline' as const,
    iconColor: colors.purple,
  },
  {
    id: 'email',
    title: 'Email support',
    subtitle: 'support@trustopay.in',
    icon: 'mail-outline' as const,
    iconColor: colors.blue600,
  },
  {
    id: 'call',
    title: 'Call us',
    subtitle: 'Mon-Sat, 9 AM - 7 PM',
    icon: 'call-outline' as const,
    iconColor: colors.green600,
  },
];

export function HelpCentrePage({ isOpen, onClose }: HelpCentrePageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help Centre</Text>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.searchIconWrap} pointerEvents="none">
            <Ionicons name="help-circle-outline" size={20} color={colors.gray400} />
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>POPULAR TOPICS</Text>
          {POPULAR_TOPICS.map((topic) => (
            <TouchableOpacity key={topic.id} activeOpacity={0.7}>
              <Card style={styles.topicCard}>
                <View style={[styles.topicIconWrap, { backgroundColor: topic.iconColor + '20' }]}>
                  <Ionicons name={topic.icon} size={24} color={topic.iconColor} />
                </View>
                <View style={styles.topicContent}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicDesc}>{topic.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
              </Card>
            </TouchableOpacity>
          ))}

          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>STILL NEED HELP?</Text>
          {CONTACT_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.id} activeOpacity={0.7}>
              <Card style={styles.contactCard}>
                <View style={[styles.contactIconWrap, { backgroundColor: opt.iconColor + '20' }]}>
                  <Ionicons name={opt.icon} size={24} color={opt.iconColor} />
                </View>
                <View style={styles.contactContent}>
                  <Text style={styles.contactTitle}>{opt.title}</Text>
                  <Text style={styles.contactSub}>{opt.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
              </Card>
            </TouchableOpacity>
          ))}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
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
  searchWrap: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.white, position: 'relative' },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 44,
    fontSize: 16,
    color: colors.navy,
    backgroundColor: colors.gray50,
  },
  searchIconWrap: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400,
    letterSpacing: 1,
    marginBottom: 12,
  },
  sectionTitleSpaced: { marginTop: 8 },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
  },
  topicIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  topicContent: { flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: '600', color: colors.navy },
  topicDesc: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 16,
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactContent: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '600', color: colors.navy },
  contactSub: { fontSize: 13, color: colors.gray500, marginTop: 2 },
});
