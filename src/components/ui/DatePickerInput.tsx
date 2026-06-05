import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';

interface DatePickerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateForDisplay(iso: string): string {
  if (!iso || !iso.trim()) return '';
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString('default', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function parseDate(s: string): Date | null {
  if (!s.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function DatePickerInput({ value, onChangeText, label, placeholder = 'Select date' }: DatePickerInputProps) {
  const [show, setShow] = useState(false);
  const dateValue = (value && parseDate(value)) || new Date();

  const handleChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) {
      onChangeText(toISODate(selectedDate));
    }
  };

  const handlePress = () => setShow(true);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} style={styles.input} activeOpacity={0.7}>
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value ? formatDateForDisplay(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={colors.purple} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={handleChange}
          accentColor={colors.purple}
          themeVariant="light"
        />
      )}
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity onPress={() => setShow(false)} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.navy,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
  },
  inputText: {
    fontSize: 16,
    color: colors.navy,
  },
  placeholder: {
    color: colors.gray400,
  },
  doneBtn: {
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.purple,
  },
});
