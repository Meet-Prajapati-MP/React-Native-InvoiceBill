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
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';
import { api } from '../services/api';

interface ForgotPasswordPageProps {
  onSuccess: () => void;
  onBack: () => void;
  initialEmail?: string;
}

export function ForgotPasswordPage({
  onSuccess,
  onBack,
  initialEmail = '',
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async () => {
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
      await api.post('/auth/forgot-password', { email: trimmed });
      setSent(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || 'Failed to send reset link. Please try again.',
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
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            {sent
              ? 'Check your email for the reset link. Click the link, set your new password, then sign in.'
              : 'Confirm link first. Enter your email and we\'ll send you a reset link.'}
          </Text>
        </AnimatedSlideIn>

        {!sent && (
          <AnimatedSlideIn delay={160}>
            <View style={styles.formCard}>
              <Input
                label="Email"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <Button
                onPress={handleSendLink}
                disabled={loading}
                style={styles.sendBtn}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  'Send reset link'
                )}
              </Button>
            </View>
          </AnimatedSlideIn>
        )}

        {sent && (
          <AnimatedSlideIn delay={160}>
            <Button onPress={onSuccess} variant="outline" style={styles.backToSignIn}>
              Back to sign in
            </Button>
          </AnimatedSlideIn>
        )}
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
    lineHeight: 24,
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
    marginTop: 8,
  },
  backToSignIn: {
    marginTop: 16,
  },
});
