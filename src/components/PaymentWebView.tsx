import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { API_BASE } from '../config/api';

interface PaymentWebViewProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectUrl: string;
}

export function PaymentWebView({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl,
}: PaymentWebViewProps) {
  const [loading, setLoading] = useState(true);
  const fullUrl = redirectUrl.startsWith('http') ? redirectUrl : `${API_BASE}${redirectUrl}`;

  const handleNavigationStateChange = (navState: { url?: string }) => {
    const url = navState.url || '';
    if (url.includes('/payments/callback')) {
      setLoading(false);
    }
  };

  const handleMessage = (event: { nativeEvent?: { data?: string } }) => {
    const data = event.nativeEvent?.data;
    if (data === 'PAYMENT_SUCCESS') {
      onSuccess?.();
      onClose();
    } else if (data === 'PAYMENT_FAILED' || data === 'PAYMENT_CLOSE') {
      onClose();
    }
  };

  if (!isOpen || !redirectUrl) return null;

  return (
    <Modal visible={isOpen} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay with SabPaisa</Text>
          <View style={styles.headerSpacer} />
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Loading payment...</Text>
          </View>
        )}
        <WebView
          source={{ uri: fullUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          scalesPageToFit
          originWhitelist={['*']}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? 48 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  closeBtn: { padding: 8, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: colors.navy },
  headerSpacer: { width: 40 },
  webview: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: { marginTop: 12, fontSize: 14, color: colors.gray600 },
});
