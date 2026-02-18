import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';
import { api } from '../services/api';

type OtpMode = 'forgot-password' | 'login';

interface OtpVerificationPageProps {
  email: string;
  mode?: OtpMode;
  onSuccess: (result: { resetToken?: string; session?: { access_token: string; refresh_token?: string }; user?: unknown }) => void;
  onBack: () => void;
}

const OTP_LENGTH = 6;

export function OtpVerificationPage({
  email,
  mode = 'forgot-password',
  onSuccess,
  onBack,
}: OtpVerificationPageProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const otpString = otp.join('');

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const digits = value.split('');
    const newOtp = [...otp];
    if (digits.length === 0) {
      newOtp[index] = '';
      setOtp(newOtp);
      if (index > 0) focusInput(index - 1);
      return;
    }
    if (digits.length === 1) {
      newOtp[index] = digits[0];
      setOtp(newOtp);
      setError('');
      if (index < OTP_LENGTH - 1) focusInput(index + 1);
      return;
    }
    // Paste: fill multiple boxes
    digits.slice(0, OTP_LENGTH - index).forEach((d, i) => {
      if (index + i < OTP_LENGTH) newOtp[index + i] = d;
    });
    setOtp(newOtp);
    setError('');
    const nextEmpty = newOtp.findIndex((c) => !c);
    focusInput(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty);
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleVerify = async () => {
    if (otpString.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post<{ user: unknown; session: { access_token: string; refresh_token?: string } }>('/auth/login-with-otp', {
          email,
          code: otpString,
        });
        if (data.session?.access_token) {
          onSuccess({ user: data.user, session: data.session });
        } else {
          setError('Invalid response. Please try again.');
        }
      } else {
        const { data } = await api.post<{ resetToken: string }>('/auth/verify-otp', {
          email,
          code: otpString,
        });
        if (data.resetToken) {
          onSuccess({ resetToken: data.resetToken });
        } else {
          setError('Invalid response. Please try again.');
        }
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || 'Invalid code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await api.post('/auth/send-otp', { email });
      setResendCooldown(60);
      const id = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(id);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] } } };
      const msg = err?.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg[0] : msg || 'Could not resend. Try again.',
      );
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
            Enter the 6 digit code{'\n'}you received via email
          </Text>
        </AnimatedSlideIn>

        <AnimatedSlideIn delay={160}>
          <View style={styles.formCard}>
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(r) => { inputRefs.current[index] = r; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                    error ? styles.otpBoxError : null,
                  ]}
                  value={digit}
                  onChangeText={(v) => handleChange(v, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  selectTextOnFocus
                  onFocus={() => setError('')}
                />
              ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              onPress={handleVerify}
              style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
              disabled={loading || otpString.length !== OTP_LENGTH}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResend}
              style={styles.resendBtn}
              disabled={resendCooldown > 0}
            >
              <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedSlideIn>

        <AnimatedSlideIn delay={240}>
          <Text style={styles.destination}>Code sent to {email}</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 30,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: 10,
    backgroundColor: colors.white,
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.purple,
  },
  otpBoxError: {
    borderColor: colors.red500,
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyBtn: {
    height: 52,
    backgroundColor: colors.purple,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  resendBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.purple,
  },
  resendDisabled: {
    color: colors.gray400,
  },
  destination: {
    fontSize: 13,
    color: colors.purpleLight,
    marginTop: 24,
    textAlign: 'center',
  },
});
