import { useEffect, useRef } from 'react';
import { registerForPushNotifications } from '../services/pushNotifications';

/**
 * Registers push token when user is authenticated.
 * Token is only requested after permission is granted. Never crashes.
 * Delays slightly so session is ready after login.
 */
export function PushRegistration({ isAuthenticated }: { isAuthenticated: boolean }) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
      return;
    }
    // Delay so session/token is ready after login
    const t = setTimeout(async () => {
      if (registeredRef.current) return;
      await registerForPushNotifications();
      registeredRef.current = true;
    }, 500);
    return () => clearTimeout(t);
  }, [isAuthenticated]);

  return null;
}
