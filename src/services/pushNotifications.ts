/**
 * Push notification registration – token only allocated after user grants permission.
 * App never crashes: all operations are wrapped in try/catch, null token is handled.
 */
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from './api';

/** EAS project ID – must match app.json extra.eas.projectId for valid push tokens */
const EAS_PROJECT_ID = '9de272ac-7514-4414-9d49-77c2bda11b08';

/** Request permission, get token only if granted. Returns null if denied/emulator/error. Never throws. */
export async function getExpoPushTokenAsync(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      if (__DEV__) console.log('[Push] Skipped: not a physical device');
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
      if (__DEV__) console.log('[Push] Skipped: permission not granted');
      return null;
    }

    // Token allocation only after permission is granted – re-check to be sure
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    if (currentStatus !== 'granted') {
      if (__DEV__) console.log('[Push] Skipped: permission revoked before token allocation');
      return null;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId ??
      EAS_PROJECT_ID;
    if (!projectId) {
      if (__DEV__) console.log('[Push] Skipped: no projectId');
      return null;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    const result = token && typeof token === 'string' ? token : null;
    if (__DEV__ && result) console.log('[Push] Token obtained');
    return result;
  } catch (e) {
    if (__DEV__) console.warn('[Push] getExpoPushTokenAsync error:', e);
    return null;
  }
}

/** Register push token with backend. Only called when token exists. Never throws. */
export async function registerPushTokenWithBackend(token: string): Promise<boolean> {
  try {
    await api.post('/register-push-token', { token });
    if (__DEV__) console.log('[Push] Token saved to backend');
    return true;
  } catch (e) {
    if (__DEV__) console.warn('[Push] registerPushTokenWithBackend failed:', e);
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
  } catch (e) {
    if (__DEV__) console.warn('[Push] registerForPushNotifications error:', e);
  }
}
