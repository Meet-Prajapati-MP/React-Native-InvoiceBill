import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { colors } from '../theme/colors';

interface MyProfilePageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyProfilePage({ isOpen, onClose }: MyProfilePageProps) {
  const [fullName, setFullName] = useState('Arjun Mehta');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [email, setEmail] = useState('arjun.mehta@example.com');
  const [pinCode, setPinCode] = useState('');

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AM</Text>
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Ionicons name="camera" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

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

          <Button variant="outline" onPress={onClose} style={styles.doneBtn}>
            Done
          </Button>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: 16,
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
});
