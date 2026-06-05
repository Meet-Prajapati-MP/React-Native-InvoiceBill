import React from 'react';
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
import { Card } from '../components/ui/Card';
import { colors } from '../theme/colors';

interface MessageCentrePageProps {
  isOpen: boolean;
  onClose: () => void;
}

const MESSAGES = [
  {
    id: '1',
    title: 'Welcome to Trustopay! 🎉',
    description: "Thanks for joining. Here's how to get started with your first invoice...",
    timestamp: '2 days ago',
    icon: 'trophy-outline' as const,
    iconColor: colors.purple,
    unread: false,
  },
  {
    id: '2',
    title: 'Payment Received',
    description: '₹25,000 received from Creative Studio for INV-002. Funds added to wallet.',
    timestamp: 'Yesterday',
    icon: 'arrow-down-circle-outline' as const,
    iconColor: colors.green600,
    unread: false,
  },
  {
    id: '3',
    title: 'Invoice Overdue Reminder',
    description: 'INV-003 for Global Services (₹5,000) is overdue. Send a reminder?',
    timestamp: '5 hours ago',
    icon: 'document-text-outline' as const,
    iconColor: colors.red500,
    unread: true,
  },
  {
    id: '4',
    title: 'Pro Plan Activated ✨',
    description: 'Your yearly subscription is now active. Enjoy unlimited invoices and premium features.',
    timestamp: '3 days ago',
    icon: 'star-outline' as const,
    iconColor: '#D4A017',
    unread: false,
  },
  {
    id: '5',
    title: 'New Feature: Recurring Invoices',
    description: "You can now set up recurring invoices for regular clients. Try it out!",
    timestamp: '1 week ago',
    icon: 'chatbubble-outline' as const,
    iconColor: colors.blue600,
    unread: false,
  },
];

export function MessageCentrePage({ isOpen, onClose }: MessageCentrePageProps) {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message Centre</Text>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {MESSAGES.map((msg) => (
            <TouchableOpacity key={msg.id} activeOpacity={0.7}>
              <Card style={styles.messageCard}>
                <View style={[styles.iconWrap, { backgroundColor: msg.iconColor + '25' }]}>
                  <Ionicons name={msg.icon} size={24} color={msg.iconColor} />
                </View>
                <View style={styles.messageContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.messageTitle} numberOfLines={1}>{msg.title}</Text>
                    {msg.unread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.messageDesc} numberOfLines={2}>{msg.description}</Text>
                  <Text style={styles.timestamp}>{msg.timestamp}</Text>
                </View>
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
    borderBottomColor: colors.gray200,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  messageContent: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  messageTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
    marginLeft: 8,
  },
  messageDesc: { fontSize: 14, color: colors.gray500, lineHeight: 20 },
  timestamp: { fontSize: 12, color: colors.gray400, marginTop: 6 },
});
