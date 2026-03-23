/**
 * Events for auth session lifecycle.
 * Used when API interceptor clears session (401 + refresh failed) so AuthContext can sync.
 */
type Listener = () => void;
const listeners: Listener[] = [];

export function onSessionCleared(fn: Listener): () => void {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitSessionCleared(): void {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('[authSessionEvents] listener error:', e);
    }
  });
}
