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

interface CreateAccountPageProps {
  onSuccess: () => void;
  onBack: () => void;
  onSignIn: () => void;
}

export function CreateAccountPage({ onSuccess, onBack, onSignIn }: CreateAccountPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleCreateAccount = async () => {
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || !/^[6-9]\d{9}$/.test(phoneDigits.slice(-10))) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim() || undefined, phone.trim());
      onSuccess();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string | string[] }; status?: number }; message?: string; code?: string };
      let msg: string | null = null;
      if (err?.response?.status === 429) {
        msg = 'Too many attempts. Please try again in 15 minutes.';
      } else if (err?.response?.data?.message) {
        const m = err.response.data.message;
        msg = Array.isArray(m) ? m[0] : m;
      } else if (err?.message) {
        if (err.message === 'Network Error' || err?.code === 'ECONNABORTED') {
          msg = `Cannot reach server. Backend running? Using: ${API_BASE_DEBUG}. Android emulator: use http://10.0.2.2:3000 in .env. Physical device: use http://YOUR_PC_IP:3000. Restart Expo after changing .env.`;
        } else {
          msg = err.message;
        }
      }
      setError(msg || 'Registration failed. Please try again.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Trustopay to get started</Text>
        </View>
        </AnimatedSlideIn>

        <AnimatedSlideIn delay={160}>
        <View style={styles.form}>
          <View style={styles.formCard}>
            <Input
              label="Name"
              placeholder="Your full name"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Phone No"
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Button
              onPress={handleCreateAccount}
              size="lg"
              style={styles.createBtn}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : 'Create Account'}
            </Button>
            <TouchableOpacity onPress={onSignIn} style={styles.switchLink}>
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLinkText}>Sign In</Text>
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
  createBtn: {
    height: 52,
    marginTop: 8,
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
