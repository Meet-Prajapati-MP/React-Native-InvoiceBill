import { Platform } from 'react-native';

/**
 * API base URL – set EXPO_PUBLIC_API_URL in .env (restart Expo after change).
 * - Android emulator: http://10.0.2.2:3000 (192.168.x.x does NOT work in emulator)
 * - Physical device (same WiFi): http://YOUR_PC_IP:3000 (run ipconfig → IPv4)
 * - Deployed: Your Railway URL, e.g. https://xxx.up.railway.app
 */
const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL?.trim();
const getDevApiBase = () => {
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

const PROD_URL = envUrl || 'https://YOUR_RAILWAY_APP.up.railway.app';

export const API_BASE = __DEV__ ? getDevApiBase() : PROD_URL.replace(/\/$/, '');

/** For error messages – lets user verify which URL the app is using */
export const API_BASE_DEBUG = API_BASE;
