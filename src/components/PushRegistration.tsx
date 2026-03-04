import { useEffect } from 'react';
import { registerForPushNotifications } from '../services/pushNotifications';

/**
 * Registers push token when user is authenticated.
 * Token is only requested after permission is granted. Never crashes.
 */
export function PushRegistration({ isAuthenticated }: { isAuthenticated: boolean }) {
  useEffect(() => {
    if (!isAuthenticated) return;
    registerForPushNotifications();
  }, [isAuthenticated]);

  return null;
}
