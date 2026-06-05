import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Tab = 'home' | 'invoices' | 'quotes' | 'customers' | 'menu';

const tabs: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'invoices', label: 'Invoices', icon: 'document-text-outline' },
  { id: 'quotes', label: 'Quotes', icon: 'clipboard-outline' },
  { id: 'customers', label: 'Customers', icon: 'people-outline' },
  { id: 'menu', label: 'Menu', icon: 'menu-outline' },
];

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  badges?: { invoices?: number; quotes?: number };
}

export function BottomNav({ activeTab, onTabChange, badges }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const badge = tab.id === 'invoices' ? badges?.invoices : tab.id === 'quotes' ? badges?.quotes : 0;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={tab.icon}
                size={24}
                color={isActive ? colors.purple : colors.gray500}
              />
              {badge ? <View style={styles.badge} /> : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red500,
    borderWidth: 2,
    borderColor: colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray500,
    marginTop: 4,
  },
  labelActive: {
    color: colors.purple,
  },
});
