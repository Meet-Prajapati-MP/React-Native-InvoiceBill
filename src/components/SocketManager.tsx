/**
 * Manages WebSocket connection lifecycle.
 * Connects when authenticated, disconnects on logout.
 */
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connect, disconnect } from '../services/socket';

export function SocketManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      connect().catch(() => {
        // Non-fatal: reconnection is handled by socket service
      });
    } else {
      disconnect();
    }
    return () => disconnect();
  }, [isAuthenticated]);

  return null;
}
