import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearAuthSession, getStoredToken, getStoredUser, setAuthSession } from '../services/api';

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
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthFromSession: (session: { access_token: string; refresh_token?: string; user?: unknown }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      const token = await getStoredToken();
      const storedUser = await getStoredUser();
      if (token && storedUser && typeof storedUser === 'object' && 'id' in storedUser) {
        setUser(storedUser as User);
      } else {
        setUser(null);
      }
    } catch {
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
    async (email: string, password: string, fullName?: string) => {
      const { api } = await import('../services/api');
      const { data } = await api.post<{ user: User; session?: { access_token: string; refresh_token?: string } }>(
        '/auth/register',
        { email, password, full_name: fullName },
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
