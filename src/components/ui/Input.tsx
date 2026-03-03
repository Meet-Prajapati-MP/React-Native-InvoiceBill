import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  style?: object;
  secureTextEntry?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  style,
  secureTextEntry,
  editable = true,
  keyboardType,
  maxLength,
  autoCapitalize,
  error,
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        style={[styles.input, style]}
        secureTextEntry={secureTextEntry}
        editable={editable}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.navy,
    marginBottom: 6,
  },
  error: { fontSize: 12, color: colors.red500, marginTop: 4 },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.navy,
    backgroundColor: colors.white,
  },
});
