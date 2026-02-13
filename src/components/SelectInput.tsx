import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface SelectInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}

export function SelectInput({
  label,
  value,
  onValueChange,
  options,
  placeholder = 'Select',
  error,
}: SelectInputProps) {
  const [show, setShow] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label || value || placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.input, error && styles.inputError]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>{selectedLabel}</Text>
        <Ionicons name="chevron-down-outline" size={20} color={colors.gray400} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <Modal visible={show} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShow(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Ionicons name="close-outline" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.option}
                  onPress={() => {
                    onValueChange(opt.value);
                    setShow(false);
                  }}
                >
                  <Text style={[styles.optionText, opt.value === value && styles.optionSelected]}>
                    {opt.label}
                  </Text>
                  {opt.value === value && (
                    <Ionicons name="checkmark-outline" size={20} color={colors.purple} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: colors.navy, marginBottom: 6 },
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
  inputError: { borderColor: colors.red500 },
  inputText: { fontSize: 16, color: colors.navy },
  placeholder: { color: colors.gray400 },
  errorText: { fontSize: 12, color: colors.red500, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.navy },
  optionsList: { maxHeight: 300 },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray50,
  },
  optionText: { fontSize: 16, color: colors.navy },
  optionSelected: { fontWeight: '600', color: colors.purple },
});
