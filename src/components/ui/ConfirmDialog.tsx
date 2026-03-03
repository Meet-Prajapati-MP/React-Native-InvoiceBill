import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <View style={styles.iconRow}>
                <View style={[styles.iconWrap, destructive && styles.iconWrapDestructive]}>
                  <Ionicons
                    name="warning"
                    size={24}
                    color={destructive ? colors.red500 : colors.amber500}
                  />
                </View>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, destructive && styles.confirmBtnDestructive]}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.confirmText, destructive && styles.confirmTextDestructive]}>
                    {confirmLabel}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDestructive: {
    backgroundColor: colors.red50,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.blue600,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.purple,
    borderRadius: 12,
  },
  confirmBtnDestructive: {
    backgroundColor: 'transparent',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  confirmTextDestructive: {
    color: colors.red500,
  },
});
