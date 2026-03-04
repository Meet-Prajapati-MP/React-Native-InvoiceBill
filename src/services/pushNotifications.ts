/**
 * Push notification registration – token only allocated after user grants permission.
 * App never crashes: all operations are wrapped in try/catch, null token is handled.
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from './api';

/** Request permission, get token only if granted. Returns null if denied/emulator/error. Never throws. */
export async function getExpoPushTokenAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return token && typeof token === 'string' ? token : null;
  } catch {
    return null;
  }
}

/** Register push token with backend. Only called when token exists. Never throws. */
export async function registerPushTokenWithBackend(token: string): Promise<boolean> {
  try {
    await api.post('/register-push-token', { token });
    return true;
  } catch {
    return false;
  }
}

/**
 * Request permission, get token if granted, register with backend.
 * Safe to call anytime – never crashes, handles null token.
 */
export async function registerForPushNotifications(): Promise<void> {
  try {
    const token = await getExpoPushTokenAsync();
    if (token) {
      await registerPushTokenWithBackend(token);
    }
  } catch {
    /* never crash */
  }
}
