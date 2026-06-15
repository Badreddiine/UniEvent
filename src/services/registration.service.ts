import apiClient from '@/lib/api-client';
import type { RegistrationDTO, InscriptionResponseDTO } from '@/types/api';

export const registrationService = {
  register(eventId: number) {
    return apiClient
      .post<RegistrationDTO>(`/api/events/${eventId}/register`)
      .then((r) => r.data);
  },

  cancel(eventId: number) {
    return apiClient.delete(`/api/events/${eventId}/register`);
  },

  getAttendees(eventId: number) {
    return apiClient
      .get<InscriptionResponseDTO[]>(`/api/events/${eventId}/attendees`)
      .then((r) => r.data);
  },

  getMyRegistrations() {
    return apiClient
      .get<RegistrationDTO[]>('/api/users/me/registrations')
      .then((r) => r.data);
  },
};
