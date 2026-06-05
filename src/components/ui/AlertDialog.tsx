import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../theme/colors';

export interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onOK: () => void;
}

export function AlertDialog({
  visible,
  title,
  message,
  onOK,
}: AlertDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onOK}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              <TouchableOpacity
                style={styles.okBtn}
                onPress={onOK}
                activeOpacity={0.7}
              >
                <Text style={styles.okText}>OK</Text>
              </TouchableOpacity>
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
  okBtn: {
    backgroundColor: colors.purple,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  okText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
