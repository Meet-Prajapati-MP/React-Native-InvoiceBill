import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';
import { api } from '../services/api';

type Step = 'email' | 'otp' | 'password';

interface ForgotPasswordPageProps {
  onSuccess: () => void;
  onBack: () => void;
  initialEmail?: string;
}

const OTP_LENGTH = 6;

export function ForgotPasswordPage({
  onSuccess,
  onBack,
  initialEmail = '',
}: ForgotPasswordPageProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

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
      await api.post('/auth/forgot-password', { email: trimmed });
      setStep('otp');
      setOtp(Array(OTP_LENGTH).fill(''));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) next[index + i] = d;
      });
      setOtp(next);
      const nextFocus = Math.min(index + digits.length, OTP_LENGTH - 1);
      otpRefs.current[nextFocus]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('Please enter the 6-digit code from your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ reset_token: string }>('/auth/verify-reset-otp', {
        email: email.trim(),
        otp: code,
      });
      setResetToken(data.reset_token);
      setStep('password');
      setPassword('');
      setConfirmPassword('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Invalid or expired code. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password-with-otp', {
        reset_token: resetToken,
        new_password: password,
      });
      onSuccess();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const otpComplete = otp.join('').length === OTP_LENGTH;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AnimatedSlideIn delay={0}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
        </AnimatedSlideIn>

        <View style={styles.content}>
          <AnimatedSlideIn delay={80}>
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Image source={require('../../assets/app-icon.png')} style={styles.logoImage} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                {step === 'email' && 'Enter your email and we\'ll send you a 6-digit code.'}
                {step === 'otp' && 'Enter the 6-digit code sent to your email.'}
                {step === 'password' && 'Create a new password.'}
              </Text>
            </View>
          </AnimatedSlideIn>

          {step === 'email' && (
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
                <Button onPress={handleSendOtp} disabled={loading} style={styles.sendBtn}>
                  {loading ? <ActivityIndicator color={colors.white} size="small" /> : 'Send code'}
                </Button>
              </View>
            </AnimatedSlideIn>
          )}

          {step === 'otp' && (
            <AnimatedSlideIn delay={160}>
              <View style={styles.formCard}>
                <Text style={styles.otpHint}>Sent to {email}</Text>
                <Text style={styles.otpLabel}>Verification code</Text>
                <View style={styles.otpRow}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(r) => { otpRefs.current[i] = r; }}
                      style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(i, v)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(i, nativeEvent.key)}
                      keyboardType="number-pad"
                      maxLength={2}
                      selectTextOnFocus
                    />
                  ))}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button
                  onPress={handleVerifyOtp}
                  disabled={loading || !otpComplete}
                  style={styles.sendBtn}
                >
                  {loading ? <ActivityIndicator color={colors.white} size="small" /> : 'Verify'}
                </Button>
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={loading}
                  style={styles.resendLink}
                >
                  <Text style={styles.resendText}>Didn't receive code? Resend</Text>
                </TouchableOpacity>
              </View>
            </AnimatedSlideIn>
          )}

          {step === 'password' && (
            <AnimatedSlideIn delay={160}>
              <View style={styles.formCard}>
                <Input
                  label="New password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!loading}
                />
                <Input
                  label="Confirm password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  editable={!loading}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <Button onPress={handleSavePassword} disabled={loading} style={styles.sendBtn}>
                  {loading ? <ActivityIndicator color={colors.white} size="small" /> : 'Save'}
                </Button>
              </View>
            </AnimatedSlideIn>
          )}
        </View>

        <AnimatedSlideIn delay={240}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Crafted with ❤️ in Gujarat</Text>
            <View style={styles.tricolor}>
              <View style={[styles.tricolorBar, { backgroundColor: colors.saffron }]} />
              <View style={[styles.tricolorBar, { backgroundColor: colors.white }]} />
              <View style={[styles.tricolorBar, { backgroundColor: colors.indianGreen }]} />
            </View>
          </View>
        </AnimatedSlideIn>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
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
  otpHint: {
    fontSize: 13,
    color: colors.gray500,
    marginBottom: 8,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  otpBoxFilled: {
    borderColor: colors.purple,
    backgroundColor: colors.purple50,
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    marginBottom: 16,
  },
  resendLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.purple,
    fontWeight: '600',
  },
  sendBtn: {
    height: 52,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.purpleLight,
    marginBottom: 10,
    letterSpacing: 1,
  },
  tricolor: {
    flexDirection: 'row',
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  tricolorBar: {
    flex: 1,
  },
});
