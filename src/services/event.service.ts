import apiClient from '@/lib/api-client';
import type {
  EventDTO,
  CreateEventRequest,
  PageResponse,
  CategorieEnum,
  StatutEvenementEnum,
} from '@/types/api';

export interface EventFilters {
  categorie?: CategorieEnum;
  statut?: StatutEvenementEnum;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const eventService = {
  list(filters: EventFilters = {}) {
    return apiClient
      .get<PageResponse<EventDTO>>('/api/events', { params: filters })
      .then((r) => r.data);
  },

  get(id: number) {
    return apiClient.get<EventDTO>(`/api/events/${id}`).then((r) => r.data);
  },

  create(data: CreateEventRequest) {
    return apiClient.post<EventDTO>('/api/events', data).then((r) => r.data);
  },

  update(id: number, data: Partial<CreateEventRequest>) {
    return apiClient.put<EventDTO>(`/api/events/${id}`, data).then((r) => r.data);
  },

  delete(id: number) {
    return apiClient.delete(`/api/events/${id}`);
  },

  publish(id: number) {
    return apiClient.patch<EventDTO>(`/api/events/${id}/publish`).then((r) => r.data);
  },

  // SOUMIS → VERIFIE : géré uniquement par EvenementController (/evenements),
  // il n'existe pas d'équivalent sur /api/events.
  verify(id: number) {
    return apiClient.patch(`/evenements/${id}/verifier`).then((r) => r.data);
  },

  // VERIFIE → APPROUVE via EvenementController (/evenements).
  approve(id: number) {
    return apiClient.patch(`/evenements/${id}/approuver`).then((r) => r.data);
  },

  cancel(id: number) {
    return apiClient.patch<EventDTO>(`/api/events/${id}/cancel`).then((r) => r.data);
  },
};
