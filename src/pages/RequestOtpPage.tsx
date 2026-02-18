import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../components/ui/Input';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';
import { api } from '../services/api';

interface RequestOtpPageProps {
  onOtpSent: (email: string) => void;
  onBack: () => void;
  initialEmail?: string;
  mode?: 'forgot-password' | 'login';
}

export function RequestOtpPage({ onOtpSent, onBack, initialEmail = '', mode = 'forgot-password' }: RequestOtpPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email: trimmed });
      onOtpSent(trimmed);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || 'Failed to send code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AnimatedSlideIn delay={0}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
      </AnimatedSlideIn>

      <View style={styles.content}>
        <AnimatedSlideIn delay={80}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Sign in with OTP' : 'Forgot password?'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? "Enter your email and we'll send you a verification code to sign in."
              : "Enter your email and we'll send you a verification code to reset your password."}
          </Text>
        </AnimatedSlideIn>

        <AnimatedSlideIn delay={160}>
          <View style={styles.formCard}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              onPress={handleSendOtp}
              style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.sendBtnText}>
              {mode === 'login' ? 'Send OTP' : 'Send verification code'}
            </Text>
              )}
            </TouchableOpacity>
          </View>
        </AnimatedSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
    marginTop: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.purpleLight,
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    marginBottom: 16,
  },
  sendBtn: {
    height: 52,
    backgroundColor: colors.purple,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
