import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';
import { API_BASE_DEBUG } from '../config/api';

interface SignInPageProps {
  onSuccess: () => void;
  onBack: () => void;
  onCreateAccount: () => void;
  onForgotPassword?: (email?: string) => void;
}

export function SignInPage({ onSuccess, onBack, onCreateAccount, onForgotPassword }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      onSuccess();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] }; status?: number }; message?: string; code?: string };
      let msg: string | null = null;
      if (err?.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m[0] : m;
      } else if (err?.message) {
        if (err.message === 'Network Error' || err?.code === 'ECONNABORTED') {
          msg = `Cannot reach server. Backend running? Using: ${API_BASE_DEBUG}. Android emulator: http://10.0.2.2:3000. Physical device: http://YOUR_PC_IP:3000. Restart Expo after .env change.`;
        } else {
          msg = err.message;
        }
      }
      setError(msg || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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

        <AnimatedSlideIn delay={80}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Image source={require('../../assets/app-icon.png')} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Trustopay</Text>
        </View>
        </AnimatedSlideIn>

        <AnimatedSlideIn delay={160}>
        <View style={styles.form}>
          <View style={styles.formCard}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {onForgotPassword && (
            <View style={styles.altLinks}>
              <TouchableOpacity
                onPress={() => onForgotPassword(email.trim() || undefined)}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
            )}
            <Button
              onPress={handleSignIn}
              size="lg"
              style={styles.signInBtn}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : 'Sign In'}
            </Button>
            <TouchableOpacity onPress={onCreateAccount} style={styles.switchLink}>
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.switchLinkText}>Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        </AnimatedSlideIn>

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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.purpleLight,
  },
  form: {
    marginBottom: 32,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  altLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  forgotLink: {
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.purple,
  },
  signInBtn: {
    height: 52,
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: colors.gray600,
  },
  switchLinkText: {
    color: colors.purple,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: colors.red500,
    marginBottom: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
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
