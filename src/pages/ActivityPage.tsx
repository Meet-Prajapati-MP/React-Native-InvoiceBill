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
import { colors } from '../theme/colors';

interface ActivityPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITIES = [
  {
    id: '1',
    type: 'invoice',
    icon: 'document-text',
    iconBg: colors.purple100,
    iconColor: colors.purple,
    title: 'Invoice INV-006 Sent',
    sub: 'Sent to Priya Sharma',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'payment-in',
    icon: 'arrow-down',
    iconBg: colors.green100,
    iconColor: colors.green600,
    title: 'Payment Received',
    sub: '₹45,000 from Design Studio',
    time: 'Yesterday',
  },
  {
    id: '3',
    type: 'payment-out',
    icon: 'arrow-up',
    iconBg: colors.red50,
    iconColor: colors.red500,
    title: 'Payment Sent',
    sub: '₹2,500 to Rahul Verma',
    time: 'Yesterday',
  },
  {
    id: '4',
    type: 'subscription',
    icon: 'star',
    iconBg: colors.orange50,
    iconColor: colors.amber500,
    title: 'Subscription Activated',
    sub: 'Yearly Pro Plan',
    time: '2 days ago',
  },
  {
    id: '5',
    type: 'customer',
    icon: 'person-add',
    iconBg: colors.blue100,
    iconColor: colors.blue600,
    title: 'New Customer Added',
    sub: 'Manish Gupta',
    time: '3 days ago',
  },
];

export function ActivityPage({ isOpen, onClose }: ActivityPageProps) {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.timeline}>
            {ACTIVITIES.map((item, index) => (
              <View key={item.id} style={styles.activityRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>
                  {index < ACTIVITIES.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.activityContent}>
                  <View style={styles.activityTextRow}>
                    <View style={styles.activityTextWrap}>
                      <Text style={styles.activityTitle}>{item.title}</Text>
                      <Text style={styles.activitySub}>{item.sub}</Text>
                    </View>
                    <Text style={styles.activityTime}>{item.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
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
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },
  timeline: {},
  activityRow: { flexDirection: 'row', marginBottom: 8 },
  timelineLeft: { alignItems: 'center', marginRight: 16 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: colors.gray200,
    marginTop: 4,
  },
  activityContent: { flex: 1, paddingBottom: 20 },
  activityTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  activityTextWrap: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '700', color: colors.navy },
  activitySub: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  activityTime: { fontSize: 12, color: colors.gray400 },
});
