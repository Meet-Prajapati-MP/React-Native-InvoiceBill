import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { AlertDialog } from '../components/ui/AlertDialog';
import { useProfile, getInitials } from '../context/ProfileContext';
import { api } from '../services/api';
import { colors } from '../theme/colors';
import { AnimatedSlideIn } from '../components/AnimatedSlideIn';

interface MyProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPhoneForDisplay(phone: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}

export function MyProfilePage({ isOpen, onClose }: MyProfilePageProps) {
  const { profile, refreshProfile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlertDialog({ title: 'Permission needed', message: 'Please allow access to your photos to set a profile picture.' });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;
      // Resize to max 512px to reduce payload (avoids "request entity too large")
      const manipulated = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 512 } }], {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      const response = await fetch(manipulated.uri);
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setUploading(true);
      await api.post('/profiles/me/avatar', { imageBase64: base64 });
      await refreshProfile();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Failed to update photo.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen && profile) {
      setFullName(profile.full_name || '');
      setMobile(formatPhoneForDisplay(profile.phone));
      setEmail(profile.email || '');
      setPinCode(profile.pincode || '');
    }
  }, [isOpen, profile]);

  const handleSave = async () => {
    const phoneDigits = mobile.replace(/\D/g, '');
    if (!fullName.trim()) {
      setAlertDialog({ title: 'Error', message: 'Please enter your full name.' });
      return;
    }
    if (phoneDigits.length < 10) {
      setAlertDialog({ title: 'Error', message: 'Please enter a valid 10-digit phone number.' });
      return;
    }
    setSaving(true);
    try {
      await api.patch('/profiles/me', {
        full_name: fullName.trim(),
        phone: phoneDigits.slice(-10),
        email: email.trim() || undefined,
        pincode: pinCode.trim() || undefined,
      });
      await refreshProfile();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message || 'Failed to save profile.';
      setAlertDialog({ title: 'Error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <AnimatedSlideIn delay={80}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatarImage}
                    onError={() => {}}
                  />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(fullName || profile?.full_name)}</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.cameraBtn, uploading && styles.cameraBtnDisabled]}
                onPress={handlePickPhoto}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="camera" size={16} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
          </AnimatedSlideIn>

          <AnimatedSlideIn delay={160}>
          <View style={styles.form}>
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="person-outline" size={20} color={colors.gray500} />
              </View>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>FULL NAME</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.infoInput}
                  placeholderTextColor={colors.gray400}
                />
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={20} color={colors.gray500} />
              </View>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
                <TextInput
                  value={mobile}
                  onChangeText={setMobile}
                  style={styles.infoInput}
                  placeholderTextColor={colors.gray400}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color={colors.gray500} />
              </View>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.infoInput}
                  placeholderTextColor={colors.gray400}
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color={colors.gray500} />
              </View>
              <View style={styles.infoField}>
                <Text style={styles.infoLabel}>PIN CODE (Optional)</Text>
                <TextInput
                  value={pinCode}
                  onChangeText={setPinCode}
                  placeholder="Enter pin code"
                  style={styles.infoInput}
                  placeholderTextColor={colors.gray400}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
          </AnimatedSlideIn>

          <Button onPress={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              'Save'
            )}
          </Button>
          <View style={{ height: 40 }} />
        </ScrollView>

        <AlertDialog
          visible={!!alertDialog}
          title={alertDialog?.title ?? ''}
          message={alertDialog?.message ?? ''}
          onOK={() => setAlertDialog(null)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginLeft: 8 },
  headerSpacer: { width: 40 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 24 },
  avatarSection: { alignItems: 'center', marginTop: 24, marginBottom: 32 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: colors.white },
  avatarImage: { width: 96, height: 96, borderRadius: 48 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  cameraBtnDisabled: { opacity: 0.7 },
  form: { marginBottom: 24 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoField: { flex: 1 },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray400,
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.navy,
    backgroundColor: colors.white,
  },
  doneBtn: {
    backgroundColor: colors.gray200,
    height: 48,
  },
  saveBtn: {
    backgroundColor: colors.purple,
    height: 48,
  },
});
