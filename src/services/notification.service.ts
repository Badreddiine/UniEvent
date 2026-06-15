import apiClient from '@/lib/api-client';
import type { NotificationResponseDTO, PageResponse } from '@/types/api';

export const notificationService = {
  list(params?: { page?: number; size?: number }) {
    return apiClient
      .get<PageResponse<NotificationResponseDTO>>('/api/notifications', { params })
      .then((r) => r.data);
  },

  markRead(id: number) {
    return apiClient
      .patch<NotificationResponseDTO>(`/api/notifications/${id}/read`)
      .then((r) => r.data);
  },

  markAllRead() {
    return apiClient.patch('/api/notifications/read-all');
  },
};
