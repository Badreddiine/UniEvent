import apiClient from '@/lib/api-client';
import type { BadgeDto } from '@/types/api';

export const badgeService = {
  generate(registrationId: number) {
    return apiClient
      .get<BadgeDto>(`/api/registrations/${registrationId}/badge`)
      .then((r) => r.data);
  },

  verify(token: string) {
    return apiClient
      .get<BadgeDto>(`/api/badges/verify/${token}`)
      .then((r) => r.data);
  },

  checkIn(token: string) {
    return apiClient
      .patch<BadgeDto>(`/api/badges/verify/${token}/check-in`)
      .then((r) => r.data);
  },
};
