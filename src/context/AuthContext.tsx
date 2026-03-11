import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  sessionStore,
} from '../services/api';

interface User {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthFromSession: (session: { access_token: string; refresh_token?: string; user?: unknown }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** App version used to invalidate session when app is updated/reinstalled */
function getCurrentAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    const clearAndAbort = async () => {
      await clearAuthSession();
      setUser(null);
    };

    try {
      const token = await getStoredToken();

      // No token: ensure clean state and show Login
      if (!token || typeof token !== 'string' || token.trim() === '') {
        await clearAndAbort();
        return;
      }

      // App version check: require re-login after app update/reinstall
      // If no stored version (legacy session) or version mismatch, invalidate
      const currentVersion = getCurrentAppVersion();
      const storedVersion = await sessionStore.getAuthVersion();
      if (storedVersion !== currentVersion) {
        await clearAndAbort();
        return;
      }

      // Safely parse stored user (handle corrupted JSON)
      let storedUser: unknown = null;
      try {
        storedUser = await getStoredUser();
      } catch {
        await clearAndAbort();
        return;
      }

      if (!storedUser || typeof storedUser !== 'object' || !('id' in storedUser)) {
        await clearAndAbort();
        return;
      }

      // Validate token with backend before trusting stored session
      const { api } = await import('../services/api');
      const { data } = await api.get<{ user: unknown }>('/auth/me');

      if (data?.user && typeof data.user === 'object' && 'id' in data.user) {
        setUser(data.user as User);
        await sessionStore.setAuthVersion(currentVersion);
      } else {
        await clearAndAbort();
      }
    } catch (err: unknown) {
      // Clear session on any validation failure (401, network error, etc.)
      await clearAuthSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const setAuthFromSession = useCallback(
    async (session: { access_token: string; refresh_token?: string; user?: unknown }) => {
      await setAuthSession(session);
      if (session.user && typeof session.user === 'object' && 'id' in session.user) {
        setUser(session.user as User);
        await sessionStore.setAuthVersion(getCurrentAppVersion());
      }
    },
    [],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const { api } = await import('../services/api');
      const { data } = await api.post<{ user: User; session: { access_token: string; refresh_token?: string } }>(
        '/auth/login',
        { email, password },
      );
      if (!data.session?.access_token) throw new Error('No session');
      await setAuthFromSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: data.user,
      });
    },
    [setAuthFromSession],
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string, phone?: string) => {
      const { api } = await import('../services/api');
      const { data } = await api.post<{ user: User; session?: { access_token: string; refresh_token?: string } }>(
        '/auth/register',
        { email, password, full_name: fullName, phone },
      );
      if (data.session?.access_token) {
        await setAuthFromSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          user: data.user,
        });
      } else {
        setUser(data.user as User);
      }
    },
    [setAuthFromSession],
  );

  const logout = useCallback(async () => {
    try {
      const { api } = await import('../services/api');
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    await clearAuthSession();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setAuthFromSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
