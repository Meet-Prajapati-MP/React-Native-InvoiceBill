import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

function getIconForType(type: string, title?: string): { name: keyof typeof Ionicons.glyphMap; bg: string; color: string } {
  const isOverdue = (title || '').toLowerCase().includes('overdue');
  if (isOverdue) return { name: 'alert-circle-outline', bg: colors.red50, color: colors.red500 };
  switch (type) {
    case 'invoice':
      return { name: 'document-text-outline', bg: colors.purple100, color: colors.purple };
    case 'quotation':
      return { name: 'document-outline', bg: colors.purple100, color: colors.purple };
    case 'payment':
      return { name: 'checkmark-circle-outline', bg: colors.green100, color: colors.green600 };
    case 'recurring':
      return { name: 'refresh-outline', bg: colors.purple100, color: colors.purple };
    default:
      return { name: 'notifications-outline', bg: colors.blue100, color: colors.blue600 };
  }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const { refreshUnreadCount } = useNotifications();
  const hasLoadedOnceRef = useRef(false);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setFetchError(null);
    try {
      const { data } = await api.get<{ notifications?: Notification[] } | Notification[]>('/notifications');
      const list = Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data)
          ? data
          : (data as Record<string, unknown>)?.notifications ?? [];
      setNotifications(Array.isArray(list) ? list : []);
      await refreshUnreadCount();
      if (__DEV__ && list.length > 0) console.log('[NotificationPanel] Loaded', list.length, 'notifications');
    } catch (e: unknown) {
      setNotifications([]);
      const status = (e as { response?: { status?: number } })?.response?.status;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFetchError(status === 401 ? 'Please sign in to view notifications' : msg || 'Failed to load notifications');
      if (__DEV__) console.warn('[NotificationPanel] Fetch failed:', status, msg || e);
    }
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (isOpen && !hasLoadedOnceRef.current) {
      setLoading(true);
      fetchNotifications().finally(() => {
        setLoading(false);
        hasLoadedOnceRef.current = true;
      });
    }
  }, [isOpen, fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    await refreshUnreadCount();
    setRefreshing(false);
  }, [fetchNotifications, refreshUnreadCount]);

  const handleMarkRead = useCallback(
    async (id: string) => {
      setMarkingRead(id);
      try {
        await api.patch(`/notifications/read/${id}`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
        await refreshUnreadCount();
      } catch {
        // non-fatal
      } finally {
        setMarkingRead(null);
      }
    },
    [refreshUnreadCount],
  );

  const handleMarkAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await refreshUnreadCount();
    } catch {
      // non-fatal
    }
  }, [refreshUnreadCount]);

  if (!isOpen) return null;

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <View style={styles.headerActions}>
              {hasUnread && (
                <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.purple} />
            </View>
          ) : fetchError ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>Unable to load</Text>
              <Text style={styles.emptySub}>{fetchError}</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySub}>You're all caught up!</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.purple]}
                  tintColor={colors.purple}
                />
              }
            >
              {notifications.map((n) => {
                const icon = getIconForType(n.type, n.title);
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.item, !n.is_read && styles.itemUnread]}
                    onPress={() => !n.is_read && handleMarkRead(n.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                      <Ionicons name={icon.name} size={22} color={icon.color} />
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{n.title}</Text>
                      {n.body ? (
                        <Text style={styles.itemBody} numberOfLines={2}>
                          {n.body}
                        </Text>
                      ) : null}
                      <Text style={styles.itemTime}>{formatTimeAgo(n.created_at)}</Text>
                    </View>
                    {!n.is_read && (
                      <View style={styles.unreadDot}>
                        {markingRead === n.id ? (
                          <ActivityIndicator size="small" color={colors.purple} />
                        ) : (
                          <View style={styles.dot} />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  markAllBtn: { padding: 4 },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purple,
  },
  closeBtn: { padding: 4 },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
  },
  list: { maxHeight: 400 },
  listContent: { padding: 16, paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
    marginBottom: 12,
  },
  itemUnread: {
    backgroundColor: colors.purple50,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  itemBody: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 20,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 12,
    color: colors.gray400,
  },
  unreadDot: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },
});
