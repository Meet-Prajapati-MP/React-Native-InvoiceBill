import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  AUTH_APP_VERSION: 'auth_app_version',
} as const;

export interface StoredSession {
  access_token: string;
  refresh_token?: string;
  user?: unknown;
}

/** Use SecureStore (encrypted) on native; AsyncStorage on web. MobSF: improves score. */
const useSecureStore = Platform.OS === 'web' ? false : true;

async function setSecure(key: string, value: string): Promise<void> {
  if (useSecureStore) {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      /* fallback to AsyncStorage */
    }
  }
  await AsyncStorage.setItem(key, value);
}

async function getSecure(key: string): Promise<string | null> {
  if (useSecureStore) {
    try {
      const val = await SecureStore.getItemAsync(key);
      if (val) return val;
      const fromAsync = await AsyncStorage.getItem(key);
      if (fromAsync) {
        await setSecure(key, fromAsync);
        await AsyncStorage.removeItem(key);
        return fromAsync;
      }
      return null;
    } catch {
      return AsyncStorage.getItem(key);
    }
  }
  return AsyncStorage.getItem(key);
}

async function removeSecure(key: string): Promise<void> {
  if (useSecureStore) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  }
  await AsyncStorage.removeItem(key);
}

/**
 * Session store – centralizes auth session persistence.
 * Tokens stored in SecureStore (Android Keystore / iOS Keychain) when available.
 */
export const sessionStore = {
  keys: KEYS,

  async set(session: StoredSession): Promise<void> {
    await setSecure(KEYS.ACCESS_TOKEN, session.access_token);
    if (session.refresh_token) {
      await setSecure(KEYS.REFRESH_TOKEN, session.refresh_token);
    }
    if (session.user) {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(session.user));
    }
  },

  async clear(): Promise<void> {
    await Promise.all([
      removeSecure(KEYS.ACCESS_TOKEN),
      removeSecure(KEYS.REFRESH_TOKEN),
      AsyncStorage.multiRemove([KEYS.USER, KEYS.AUTH_APP_VERSION]),
    ]);
  },

  async setAuthVersion(version: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_APP_VERSION, version);
  },

  async getAuthVersion(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_APP_VERSION);
  },

  async getToken(): Promise<string | null> {
    return getSecure(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return getSecure(KEYS.REFRESH_TOKEN);
  },

  async getUser(): Promise<unknown | null> {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  async getSession(): Promise<StoredSession | null> {
    const token = await this.getToken();
    if (!token) return null;
    const refresh_token = await this.getRefreshToken();
    const user = await this.getUser();
    return {
      access_token: token,
      refresh_token: refresh_token ?? undefined,
      user: user ?? undefined,
    };
  },
};
