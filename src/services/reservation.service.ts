import apiClient from '@/lib/api-client';
import type {
  RoomDTO,
  ReservationResponseDTO,
  CreateReservationRequest,
} from '@/types/api';

export const reservationService = {
  listRooms(params?: { dateDebut?: string; dateFin?: string }) {
    return apiClient.get<RoomDTO[]>('/api/rooms', { params }).then((r) => r.data);
  },

  getRoom(id: number) {
    return apiClient.get<RoomDTO>(`/api/rooms/${id}`).then((r) => r.data);
  },

  listMyReservations() {
    return apiClient
      .get<ReservationResponseDTO[]>('/api/reservations')
      .then((r) => r.data);
  },

  listAllReservations() {
    return apiClient
      .get<ReservationResponseDTO[]>('/api/reservations/all')
      .then((r) => r.data);
  },

  create(data: CreateReservationRequest) {
    return apiClient
      .post<ReservationResponseDTO>('/api/reservations', data)
      .then((r) => r.data);
  },

  approve(id: number) {
    return apiClient
      .patch<ReservationResponseDTO>(`/api/reservations/${id}/approuver`)
      .then((r) => r.data);
  },

  reject(id: number) {
    return apiClient
      .patch<ReservationResponseDTO>(`/api/reservations/${id}/rejeter`)
      .then((r) => r.data);
  },

  cancel(id: number) {
    return apiClient.delete(`/api/reservations/${id}`);
  },
};
