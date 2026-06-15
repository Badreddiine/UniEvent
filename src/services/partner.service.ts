import apiClient from '@/lib/api-client';
import type {
  PartnerDto,
  CreatePartnerRequest,
  EventSponsorDto,
  CreateSponsorRequest,
  PageResponse,
} from '@/types/api';

export const partnerService = {
  list() {
    return apiClient
      .get<PageResponse<PartnerDto>>('/api/partners', { params: { size: 1000 } })
      .then((r) => r.data.content);
  },

  get(id: string) {
    return apiClient.get<PartnerDto>(`/api/partners/${id}`).then((r) => r.data);
  },

  create(data: CreatePartnerRequest) {
    return apiClient.post<PartnerDto>('/api/partners', data).then((r) => r.data);
  },

  update(id: string, data: CreatePartnerRequest) {
    return apiClient.put<PartnerDto>(`/api/partners/${id}`, data).then((r) => r.data);
  },

  delete(id: string) {
    return apiClient.delete(`/api/partners/${id}`);
  },

  getEventSponsors(eventId: number) {
    return apiClient
      .get<EventSponsorDto[]>(`/api/events/${eventId}/sponsors`)
      .then((r) => r.data);
  },

  addSponsor(eventId: number, data: CreateSponsorRequest) {
    return apiClient
      .post<EventSponsorDto>(`/api/events/${eventId}/sponsors`, data)
      .then((r) => r.data);
  },

  removeSponsor(eventId: number, sponsorId: string) {
    return apiClient.delete(`/api/events/${eventId}/sponsors/${sponsorId}`);
  },
};
