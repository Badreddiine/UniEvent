import apiClient from '@/lib/api-client';
import type {
  OverviewDto,
  DailyCountDto,
  RoomUtilizationDto,
  EventAnalyticsDto,
} from '@/types/api';

export const analyticsService = {
  getOverview() {
    return apiClient.get<OverviewDto>('/api/analytics/overview').then((r) => r.data);
  },

  getEventStats(eventId: number) {
    return apiClient
      .get<EventAnalyticsDto>(`/api/analytics/events/${eventId}`)
      .then((r) => r.data);
  },

  getRegistrationTrend(from: string, to: string) {
    return apiClient
      .get<DailyCountDto[]>('/api/analytics/registrations/trend', { params: { from, to } })
      .then((r) => r.data);
  },

  getRoomsUtilization() {
    return apiClient
      .get<RoomUtilizationDto[]>('/api/analytics/rooms/utilization')
      .then((r) => r.data);
  },
};
