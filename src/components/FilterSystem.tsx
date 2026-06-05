import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { colors } from '../theme/colors';

export interface FilterState {
  statuses: string[];
  amountRange: { min: number | null; max: number | null };
  amountQuick: string | null;
  dateQuick: string | null;
  clients: string[];
}

export interface SortOption {
  key: string;
  label: string;
}

export const AMOUNT_QUICK = [
  { key: 'lt5k', label: '< ₹5K', min: null as number | null, max: 5000 },
  { key: '5k-10k', label: '₹5K–₹10K', min: 5000, max: 10000 },
  { key: '10k-50k', label: '₹10K–₹50K', min: 10000, max: 50000 },
  { key: 'gt50k', label: '> ₹50K', min: 50000, max: null as number | null },
];

export const DATE_QUICK = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
];

export const emptyFilters: FilterState = {
  statuses: [],
  amountRange: { min: null, max: null },
  amountQuick: null,
  dateQuick: null,
  clients: [],
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  statusOptions: { value: string; label: string }[];
  clientOptions: string[];
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  statusOptions,
  clientOptions,
}: FilterPanelProps) {
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    setDraftFilters(filters);
  }, [isOpen, filters]);

  const applyFilters = () => {
    onFiltersChange(draftFilters);
    onClose();
  };

  const clearAllDraft = () => {
    setDraftFilters(emptyFilters);
  };

  const toggleDraftStatus = (status: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  };

  const toggleDraftClient = (client: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      clients: prev.clients.includes(client)
        ? prev.clients.filter((c) => c !== client)
        : [...prev.clients, client],
    }));
  };

  const setAmountQuick = (key: string | null) => {
    const aq = key ? AMOUNT_QUICK.find((a) => a.key === key) : null;
    setDraftFilters((prev) => ({
      ...prev,
      amountQuick: key,
      amountRange: aq ? { min: aq.min, max: aq.max } : { min: null, max: null },
    }));
  };

  const setDateQuick = (key: string | null) => {
    setDraftFilters((prev) => ({
      ...prev,
      dateQuick: key,
    }));
  };

  const filteredClients = clientOptions.filter((c) =>
    c.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const sheetHeight = Dimensions.get('window').height * 0.8;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.sheet, { height: sheetHeight }]} onStartShouldSetResponder={() => true}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.handle} />
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Filters</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.gray600} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.panelScroll}
              contentContainerStyle={styles.panelContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Status */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="flag" size={14} color={colors.gray500} />
                  </View>
                  <Text style={styles.sectionLabel}>STATUS</Text>
                </View>
                {statusOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleDraftStatus(opt.value)}
                    style={styles.optionRow}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        draftFilters.statuses.includes(opt.value) &&
                          styles.checkboxActive,
                      ]}
                    >
                      {draftFilters.statuses.includes(opt.value) && (
                        <Ionicons name="checkmark" size={12} color={colors.white} />
                      )}
                    </View>
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount Range */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="cash" size={14} color={colors.gray500} />
                  </View>
                  <Text style={styles.sectionLabel}>AMOUNT RANGE</Text>
                </View>
                <View style={styles.quickRow}>
                  {AMOUNT_QUICK.map((aq) => (
                    <TouchableOpacity
                      key={aq.key}
                      onPress={() =>
                        setAmountQuick(
                          draftFilters.amountQuick === aq.key ? null : aq.key
                        )
                      }
                      style={[
                        styles.quickPill,
                        draftFilters.amountQuick === aq.key &&
                          styles.quickPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          draftFilters.amountQuick === aq.key &&
                            styles.quickPillTextActive,
                        ]}
                      >
                        {aq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.minMaxRow}>
                  <View style={styles.minMaxField}>
                    <Text style={styles.minMaxLabel}>Min (₹)</Text>
                    <TextInput
                      value={
                        draftFilters.amountRange.min != null
                          ? String(draftFilters.amountRange.min)
                          : ''
                      }
                      onChangeText={(t) => {
                        const v = t ? Number(t) : null;
                        setDraftFilters((prev) => ({
                          ...prev,
                          amountQuick: null,
                          amountRange: {
                            ...prev.amountRange,
                            min: v,
                          },
                        }));
                      }}
                      placeholder="0"
                      placeholderTextColor={colors.gray400}
                      keyboardType="numeric"
                      style={styles.minMaxInput}
                    />
                  </View>
                  <View style={styles.minMaxField}>
                    <Text style={styles.minMaxLabel}>Max (₹)</Text>
                    <TextInput
                      value={
                        draftFilters.amountRange.max != null
                          ? String(draftFilters.amountRange.max)
                          : ''
                      }
                      onChangeText={(t) => {
                        const v = t ? Number(t) : null;
                        setDraftFilters((prev) => ({
                          ...prev,
                          amountQuick: null,
                          amountRange: {
                            ...prev.amountRange,
                            max: v,
                          },
                        }));
                      }}
                      placeholder="Any"
                      placeholderTextColor={colors.gray400}
                      keyboardType="numeric"
                      style={styles.minMaxInput}
                    />
                  </View>
                </View>
              </View>

              {/* Date Range */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="calendar" size={14} color={colors.gray500} />
                  </View>
                  <Text style={styles.sectionLabel}>DATE RANGE</Text>
                </View>
                <View style={styles.quickRow}>
                  {DATE_QUICK.map((dq) => (
                    <TouchableOpacity
                      key={dq.key}
                      onPress={() =>
                        setDateQuick(
                          draftFilters.dateQuick === dq.key ? null : dq.key
                        )
                      }
                      style={[
                        styles.quickPill,
                        draftFilters.dateQuick === dq.key &&
                          styles.quickPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickPillText,
                          draftFilters.dateQuick === dq.key &&
                            styles.quickPillTextActive,
                        ]}
                      >
                        {dq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Clients */}
              <View style={styles.section}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconWrap}>
                    <Ionicons name="people" size={14} color={colors.gray500} />
                  </View>
                  <Text style={styles.sectionLabel}>CLIENTS</Text>
                </View>
                <View style={styles.clientSearchWrap}>
                  <Ionicons name="search" size={14} color={colors.gray400} />
                  <TextInput
                    value={clientSearch}
                    onChangeText={setClientSearch}
                    placeholder="Search clients..."
                    placeholderTextColor={colors.gray400}
                    style={styles.clientSearchInput}
                  />
                </View>
                <ScrollView
                  style={styles.clientList}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {filteredClients.map((client) => (
                    <TouchableOpacity
                      key={client}
                      onPress={() => toggleDraftClient(client)}
                      style={styles.optionRow}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          draftFilters.clients.includes(client) &&
                            styles.checkboxActive,
                        ]}
                      >
                        {draftFilters.clients.includes(client) && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.white}
                          />
                        )}
                      </View>
                      <Text style={styles.optionText}>{client}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ height: 24 }} />
            </ScrollView>

            <View style={styles.panelFooter}>
              <Button variant="outline" onPress={clearAllDraft} style={styles.footerBtn}>
                Clear All
              </Button>
              <Button onPress={applyFilters} style={[styles.footerBtn, styles.footerBtnPrimary]}>
                Apply Filters
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface SortPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sortKey: string;
  onSortChange: (key: string) => void;
  sortOptions: SortOption[];
}

export function SortPanel({
  isOpen,
  onClose,
  sortKey,
  onSortChange,
  sortOptions,
}: SortPanelProps) {
  const handleSelect = (key: string) => {
    onSortChange(key);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sortSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Sort By</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.gray600} />
            </TouchableOpacity>
          </View>
          <View style={styles.sortContent}>
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleSelect(opt.key)}
                style={styles.sortOption}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortKey === opt.key && styles.sortOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {sortKey === opt.key && (
                  <View style={styles.sortCheck}>
                    <Ionicons name="checkmark" size={12} color={colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sortSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  keyboardView: { flex: 1 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginTop: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: colors.gray100,
    borderRadius: 999,
  },
  panelScroll: { flex: 1 },
  panelContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray500,
    letterSpacing: 1,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  optionText: {
    fontSize: 14,
    color: colors.navy,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.gray100,
  },
  quickPillActive: {
    backgroundColor: colors.purple,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray600,
  },
  quickPillTextActive: {
    color: colors.white,
  },
  minMaxRow: {
    flexDirection: 'row',
    gap: 12,
  },
  minMaxField: { flex: 1 },
  minMaxLabel: {
    fontSize: 10,
    color: colors.gray500,
    marginBottom: 4,
  },
  minMaxInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.navy,
  },
  clientSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 36,
  },
  clientSearchInput: {
    flex: 1,
    fontSize: 12,
    color: colors.navy,
    marginLeft: 8,
    padding: 0,
  },
  clientList: { maxHeight: 140 },
  panelFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
  },
  footerBtn: { flex: 1 },
  footerBtnPrimary: { flex: 2 },
  sortContent: { padding: 8, paddingBottom: 16 },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.navy,
  },
  sortOptionTextActive: {
    fontWeight: '700',
    color: colors.purple,
  },
  sortCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
