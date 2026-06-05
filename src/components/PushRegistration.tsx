import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { registerForPushNotifications } from '../services/pushNotifications';

/**
 * Registers push token when user is authenticated.
 * Token is only requested after permission is granted. Never crashes.
 * Retries on app focus so registration succeeds even if first attempt failed.
 */
export function PushRegistration({ isAuthenticated }: { isAuthenticated: boolean }) {
  const lastAttemptRef = useRef(0);
  const authRef = useRef(isAuthenticated);
  authRef.current = isAuthenticated;
  const MIN_RETRY_MS = 60_000; // Retry at most once per minute

  const tryRegister = async () => {
    if (!authRef.current) return;
    const now = Date.now();
    if (now - lastAttemptRef.current < MIN_RETRY_MS) return;
    lastAttemptRef.current = now;
    await registerForPushNotifications();
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    // Delay so session/token is ready after login
    const t = setTimeout(tryRegister, 800);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') tryRegister();
    });
    return () => sub.remove();
  }, [isAuthenticated]);

  return null;
}
