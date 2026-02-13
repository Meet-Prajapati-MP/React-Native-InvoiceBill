import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const FRAME_SIZE = 256;

interface ScanQRProps {
  isOpen: boolean;
  onClose: () => void;
}

const recentContacts = [
  { name: 'Priya Sharma', id: 'priya@upi', color: colors.blue100, textColor: colors.blue600 },
  { name: 'Rahul Verma', id: 'rahul@upi', color: colors.green100, textColor: colors.green600 },
  { name: 'Design Studio', id: 'design@hdfc', color: colors.purple100, textColor: colors.purple },
];

export function ScanQR({ isOpen, onClose }: ScanQRProps) {
  const [flash, setFlash] = useState(false);
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualInput, setManualInput] = useState('');
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isOpen || mode !== 'scan') return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isOpen, mode]);

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 4],
  });

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {mode === 'scan' ? (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Scan QR Code</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Camera Viewfinder */}
            <View style={styles.viewfinderWrap}>
              <View style={styles.overlay} />
              <View style={styles.frame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Animated.View
                  style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLineTranslate }] },
                  ]}
                />
              </View>
              <Text style={styles.hint}>Align QR code within the frame to pay</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <View style={styles.controlRow}>
                <TouchableOpacity
                  onPress={() => setFlash(!flash)}
                  style={styles.controlBtn}
                >
                  <View style={[styles.controlIcon, flash && styles.controlIconActive]}>
                    <Ionicons name="flashlight" size={20} color={flash ? colors.navy : colors.white} />
                  </View>
                  <Text style={styles.controlLabel}>Flash</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn}>
                  <View style={styles.controlIcon}>
                    <Ionicons name="image" size={20} color={colors.white} />
                  </View>
                  <Text style={styles.controlLabel}>Gallery</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => setMode('manual')}
                style={styles.manualBtn}
              >
                <Ionicons name="qr-code" size={18} color={colors.white} />
                <Text style={styles.manualBtnText}>Enter UPI ID Manually</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.manualPanel}>
            {/* Header */}
            <View style={styles.manualHeader}>
              <Text style={styles.manualHeaderTitle}>Enter Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtnDark}>
                <Ionicons name="close" size={24} color={colors.navy} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.manualContent} showsVerticalScrollIndicator={false}>
              <Input
                label="Enter UPI ID or Phone Number"
                placeholder="name@upi or +91..."
                value={manualInput}
                onChangeText={setManualInput}
              />

              <Text style={styles.recentTitle}>Recent</Text>
              {recentContacts.map((contact, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.contactRow}
                  onPress={() => setManualInput(contact.id)}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: contact.color }]}>
                    <Text style={[styles.contactAvatarText, { color: contact.textColor }]}>
                      {contact.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactId}>{contact.id}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.manualActions}>
              <Button variant="outline" onPress={() => setMode('scan')} style={styles.backBtn}>
                Back to Scan
              </Button>
              <Button disabled={!manualInput.trim()} style={styles.proceedBtn}>
                Proceed
              </Button>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
  },
  viewfinderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderColor: colors.purple, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderColor: colors.purple, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: colors.purple, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderColor: colors.purple, borderBottomRightRadius: 12 },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: colors.purple,
  },
  hint: {
    position: 'absolute',
    bottom: 96,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  controls: {
    padding: 32,
    backgroundColor: colors.navy,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 32,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 8,
  },
  controlIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconActive: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  manualBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.white,
  },
  manualPanel: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 48,
    padding: 24,
  },
  manualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  manualHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  closeBtnDark: {
    padding: 8,
  },
  manualContent: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
  },
  contactId: {
    fontSize: 12,
    color: colors.gray500,
  },
  manualActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backBtn: { flex: 1 },
  proceedBtn: { flex: 1 },
});
