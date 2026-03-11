import AsyncStorage from '@react-native-async-storage/async-storage';

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

/**
 * Session store – centralizes auth session persistence.
 * All session-related storage goes through this module.
 */
export const sessionStore = {
  keys: KEYS,

  async set(session: StoredSession): Promise<void> {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, session.access_token);
    if (session.refresh_token) {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, session.refresh_token);
    }
    if (session.user) {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(session.user));
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.ACCESS_TOKEN,
      KEYS.REFRESH_TOKEN,
      KEYS.USER,
      KEYS.AUTH_APP_VERSION,
    ]);
  },

  async setAuthVersion(version: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AUTH_APP_VERSION, version);
  },

  async getAuthVersion(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AUTH_APP_VERSION);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
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
