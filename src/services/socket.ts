/**
 * WebSocket (Socket.IO) service for real-time invoice updates.
 * - Connects when authenticated, disconnects on logout.
 * - Reconnects with exponential backoff on failure.
 * - All handlers wrapped in try-catch to prevent app crashes.
 */
import { io, Socket } from 'socket.io-client';
import { API_BASE } from '../config/api';
import { sessionStore } from './sessionStore';

const SOCKET_PATH = '/invoice-socket';
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY_MS = 1000;

type EventHandler = (payload: unknown) => void;

let socket: Socket | null = null;
let reconnectAttempts = 0;
let reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
const eventHandlers = new Map<string, Set<EventHandler>>();

function getSocketUrl(): string {
  const base = API_BASE.replace(/\/$/, '');
  if (base.startsWith('https://')) return base;
  if (base.startsWith('http://')) return base;
  return `http://${base}`;
}

function clearReconnectTimeout(): void {
  if (reconnectTimeoutId != null) {
    clearTimeout(reconnectTimeoutId);
    reconnectTimeoutId = null;
  }
}

function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    if (__DEV__) console.warn('[Socket] Max reconnect attempts reached, stopping');
    return;
  }
  clearReconnectTimeout();
  const delay = Math.min(
    INITIAL_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts),
    30000
  );
  reconnectAttempts += 1;
  if (__DEV__) console.log(`[Socket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
  reconnectTimeoutId = setTimeout(() => {
    reconnectTimeoutId = null;
    connect().catch(() => {});
  }, delay);
}

function safeInvokeHandlers(event: string, payload: unknown): void {
  try {
    const handlers = eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          if (__DEV__) console.warn(`[Socket] Handler error for ${event}:`, e);
        }
      });
    }
  } catch (e) {
    if (__DEV__) console.warn(`[Socket] Error invoking handlers for ${event}:`, e);
  }
}

/**
 * Connect to the invoice WebSocket. Call when user is authenticated.
 */
export async function connect(): Promise<void> {
  try {
    if (socket?.connected) return;

    const token = await sessionStore.getToken();
    const user = await sessionStore.getUser();
    if (!token) {
      if (__DEV__) console.log('[Socket] No token, skipping connect');
      return;
    }

    const url = getSocketUrl();
    const userId = user && typeof user === 'object' && 'id' in user ? String((user as { id: string }).id) : '';

    socket = io(url, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      auth: { token },
      query: userId ? { user_id: userId } : {},
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: INITIAL_RECONNECT_DELAY_MS,
      reconnectionDelayMax: 30000,
      timeout: 10000,
    });

    socket.on('connect', () => {
      reconnectAttempts = 0;
      if (__DEV__) console.log('[Socket] Connected');
    });

    socket.on('disconnect', (reason) => {
      if (__DEV__) console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      if (__DEV__) console.warn('[Socket] Connect error:', err?.message ?? err);
      scheduleReconnect();
    });

    socket.on('new_invoice', (payload: unknown) => {
      safeInvokeHandlers('new_invoice', payload);
    });

    socket.on('invoice_updated', (payload: unknown) => {
      safeInvokeHandlers('invoice_updated', payload);
    });

    socket.on('invoice_paid', (payload: unknown) => {
      safeInvokeHandlers('invoice_paid', payload);
    });
  } catch (e) {
    if (__DEV__) console.warn('[Socket] Connect failed:', e);
    scheduleReconnect();
    throw e;
  }
}

/**
 * Disconnect the socket. Call on logout.
 */
export function disconnect(): void {
  clearReconnectTimeout();
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS;
  try {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    eventHandlers.clear();
    if (__DEV__) console.log('[Socket] Disconnected');
  } catch (e) {
    if (__DEV__) console.warn('[Socket] Disconnect error:', e);
  }
}

/**
 * Subscribe to a socket event. Returns unsubscribe function.
 */
export function on(event: string, handler: EventHandler): () => void {
  let handlers = eventHandlers.get(event);
  if (!handlers) {
    handlers = new Set();
    eventHandlers.set(event, handlers);
  }
  handlers.add(handler);
  return () => {
    handlers?.delete(handler);
  };
}

/**
 * Check if socket is connected.
 */
export function isConnected(): boolean {
  return !!socket?.connected;
}
