import { commandCenterClient } from '../../../lib/commandCenterClient';
import type {
  NotificationItem,
  NotificationListResponse,
  NotificationUnreadCountResponse,
} from '../types/notification.types';

export const notificationService = {
  list: async (page = 1, pageSize = 30): Promise<NotificationListResponse> => {
    const r = await commandCenterClient.get<NotificationListResponse>('/notifications', {
      params: { page, page_size: pageSize },
    });
    return r.data;
  },

  getUnreadCount: async (): Promise<NotificationUnreadCountResponse> => {
    const r = await commandCenterClient.get<NotificationUnreadCountResponse>(
      '/notifications/unread-count',
    );
    return r.data;
  },

  markRead: async (notificationId: string): Promise<void> => {
    await commandCenterClient.post(`/notifications/${notificationId}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await commandCenterClient.post('/notifications/read-all');
  },
};

export type { NotificationItem };
