import { create } from 'zustand';
import { notificationsApi, Notification } from '../services/notificationsApi';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const notifications = await notificationsApi.findAll();
      const unreadCount = await notificationsApi.countUnread();
      set({ notifications, unreadCount, loading: false });
    } catch (error) {
      console.error('Erreur fetch notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      const notifications = get().notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.isRead).length 
      });
    } catch (error) {
      console.error('Erreur markAsRead:', error);
    }
  },

  addNotification: (notif) => set((state) => {
    const newNotifications = [notif, ...state.notifications];
    return {
      notifications: newNotifications,
      unreadCount: newNotifications.filter(n => !n.isRead).length
    };
  }),

  setNotifications: (notifs) => set({
    notifications: notifs,
    unreadCount: notifs.filter(n => !n.isRead).length
  }),
}));
