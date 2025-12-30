import apiClient from './apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'confirmation' | 'reminder' | 'system';
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  findAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  },

  countUnread: async (): Promise<number> => {
    const response = await apiClient.get<number>('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },
};
