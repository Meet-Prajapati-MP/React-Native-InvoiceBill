import axios, { AxiosError } from 'axios';
import { API_BASE } from '../config/api';
import { sessionStore } from './sessionStore';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await sessionStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await sessionStore.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          if (data?.session?.access_token) {
            await sessionStore.set({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
            return api(originalRequest);
          }
        } catch {
          await sessionStore.clear();
        }
      }
    }
    return Promise.reject(error);
  },
);

export { sessionStore };

export async function setAuthSession(session: {
  access_token: string;
  refresh_token?: string;
  user?: unknown;
}) {
  await sessionStore.set(session);
}

export async function clearAuthSession() {
  await sessionStore.clear();
}

export async function getStoredToken(): Promise<string | null> {
  return sessionStore.getToken();
}

export async function getStoredUser(): Promise<unknown | null> {
  return sessionStore.getUser();
}
