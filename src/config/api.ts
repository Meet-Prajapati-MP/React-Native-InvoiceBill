import { Platform } from 'react-native';

/**
 * API base URL – reads from .env (EXPO_PUBLIC_API_URL) first.
 * - Android emulator: http://10.0.2.2:3000
 * - Physical device (same WiFi): http://YOUR_PC_IP:3000 (run ipconfig)
 * - Different network: ngrok URL (run "ngrok http 3000" in backend folder)
 */
const fromEnv = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
const getDevApiBase = () => {
  if (fromEnv) return process.env.EXPO_PUBLIC_API_URL!.replace(/\/$/, '');
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

const PROD_URL = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) || 'https://YOUR_RAILWAY_APP.up.railway.app';

export const API_BASE = __DEV__ ? getDevApiBase() : PROD_URL.replace(/\/$/, '');
