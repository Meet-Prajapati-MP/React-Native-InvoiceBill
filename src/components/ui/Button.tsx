import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { colors } from '../../theme/colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface ButtonProps {
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: { backgroundColor: colors.purple },
  secondary: { backgroundColor: colors.navy },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray300 },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.red500 },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: { color: colors.white },
  secondary: { color: colors.white },
  outline: { color: colors.gray700 },
  ghost: { color: colors.gray700 },
  danger: { color: colors.white },
};

const sizeStyles = {
  sm: { height: 32, paddingHorizontal: 12 },
  md: { height: 40, paddingHorizontal: 16 },
  lg: { height: 48, paddingHorizontal: 24 },
};

export function Button({
  onPress,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, variantTextStyles[variant], size === 'sm' && styles.textSm]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
  },
  textSm: {
    fontSize: 12,
  },
  disabled: {
    opacity: 0.5,
  },
});
