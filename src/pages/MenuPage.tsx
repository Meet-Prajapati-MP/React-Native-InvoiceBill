import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface MenuPageProps {
  onNavigate: (action: string) => void;
  onOpenProfile?: () => void;
  onOpenSubscription?: () => void;
  onOpenBankAccounts?: () => void;
  onOpenActivity?: () => void;
  onOpenBusinessProfile?: () => void;
  onOpenInvoiceSettings?: () => void;
  onOpenTermsConditions?: () => void;
  onOpenMyAddresses?: () => void;
  onOpenSendReminders?: () => void;
  onOpenReportsAnalytics?: () => void;
  onOpenItemList?: () => void;
  onOpenHelpCentre?: () => void;
  onOpenMessageCentre?: () => void;
  onOpenVerificationCenter?: () => void;
  onLogOut?: () => void;
}

const menuGroups = [
  { title: 'Subscription', items: [{ icon: 'star-outline' as const, label: 'Subscription', badge: 'Pro', action: 'subscription' }] },
  {
    title: 'Manage Finances',
    items: [
      { icon: 'wallet-outline' as const, label: 'Wallet', action: 'add-money' },
      { icon: 'business-outline' as const, label: 'Bank Accounts', action: 'bank-accounts' },
      { icon: 'trending-up-outline' as const, label: 'Activity', action: 'activity' },
    ],
  },
  {
    title: 'Manage Business',
    items: [
      { icon: 'business-outline' as const, label: 'Business', action: 'business-profile' },
      { icon: 'settings-outline' as const, label: 'Invoice Settings', action: 'invoice-settings' },
      { icon: 'document-text-outline' as const, label: 'Terms & Conditions', action: 'terms-conditions' },
      { icon: 'shield-checkmark-outline' as const, label: 'Verification Center', action: 'verification-center' },
      { icon: 'location-outline' as const, label: 'My Addresses', action: 'my-addresses' },
      { icon: 'notifications-outline' as const, label: 'Send Reminders', action: 'send-reminders' },
      { icon: 'stats-chart-outline' as const, label: 'Reports & Analytics', action: 'reports-analytics' },
      { icon: 'cube-outline' as const, label: 'Item List', action: 'item-list' },
    ],
  },
  {
    title: 'Get Support',
    items: [
      { icon: 'help-circle-outline' as const, label: 'Help Centre', action: 'help-centre' },
      { icon: 'chatbubble-outline' as const, label: 'Message Centre', action: 'message-centre' },
    ],
  },
];

export function MenuPage({ onNavigate, onOpenProfile, onOpenSubscription, onOpenBankAccounts, onOpenActivity, onOpenBusinessProfile, onOpenInvoiceSettings, onOpenTermsConditions, onOpenMyAddresses, onOpenSendReminders, onOpenReportsAnalytics, onOpenItemList, onOpenHelpCentre, onOpenMessageCentre, onOpenVerificationCenter, onLogOut }: MenuPageProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        style={styles.profile}
        onPress={onOpenProfile}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AM</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Arjun Mehta</Text>
          <Text style={styles.email}>arjun.mehta@example.com</Text>
          <Text style={styles.phone}>+91 98765 43210</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.gray400} />
      </TouchableOpacity>
      {menuGroups.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          {group.items.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => {
                  if (item.action === 'subscription') onOpenSubscription?.();
                  else if (item.action === 'bank-accounts') onOpenBankAccounts?.();
                  else if (item.action === 'activity') onOpenActivity?.();
                  else if (item.action === 'business-profile') onOpenBusinessProfile?.();
                  else if (item.action === 'invoice-settings') onOpenInvoiceSettings?.();
                  else if (item.action === 'terms-conditions') onOpenTermsConditions?.();
                  else if (item.action === 'my-addresses') onOpenMyAddresses?.();
                  else if (item.action === 'send-reminders') onOpenSendReminders?.();
                  else if (item.action === 'reports-analytics') onOpenReportsAnalytics?.();
                  else if (item.action === 'item-list') onOpenItemList?.();
                  else if (item.action === 'help-centre') onOpenHelpCentre?.();
                  else if (item.action === 'message-centre') onOpenMessageCentre?.();
                  else if (item.action === 'verification-center') onOpenVerificationCenter?.();
                  else if (item.action) onNavigate(item.action);
                }}
                style={styles.menuItem}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={22} color={colors.navy} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
              </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity
        style={styles.logoutRow}
        onPress={onLogOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.red500} />
        <Text style={styles.logoutText}>Log Out</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.red500} />
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.2 • Trustopay India</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { paddingBottom: 24 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  profileInfo: { flex: 1 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purple100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: colors.purple },
  name: { fontSize: 18, fontWeight: '700', color: colors.navy },
  email: { fontSize: 14, color: colors.gray500 },
  phone: { fontSize: 14, color: colors.gray500, marginTop: 2 },
  group: { paddingHorizontal: 24, marginBottom: 24 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: colors.gray400, marginBottom: 12 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.navy, marginLeft: 12 },
  badge: {
    backgroundColor: colors.purple100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.purple },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  logoutText: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.red500, marginLeft: 12 },
  footer: { paddingHorizontal: 24, paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 12, color: colors.gray400 },
});
