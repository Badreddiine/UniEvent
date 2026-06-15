import apiClient from '@/lib/api-client';
import type {
  UserDTO,
  UpdateMeDTO,
  UtilisateurCreateDTO,
  UtilisateurResponseDTO,
  RoleUpdateDTO,
  PageResponse,
} from '@/types/api';

export const userService = {
  getMe() {
    return apiClient.get<UserDTO>('/api/users/me').then((r) => r.data);
  },

  updateMe(data: UpdateMeDTO) {
    return apiClient.put<UserDTO>('/api/users/me', data).then((r) => r.data);
  },

  list() {
    return apiClient
      .get<PageResponse<UtilisateurResponseDTO>>('/api/users', { params: { size: 1000 } })
      .then((r) => r.data.content);
  },

  create(data: UtilisateurCreateDTO) {
    return apiClient
      .post<UtilisateurResponseDTO>('/utilisateurs', data)
      .then((r) => r.data);
  },

  updateRole(userId: number, data: RoleUpdateDTO) {
    return apiClient
      .put<UtilisateurResponseDTO>(`/api/users/${userId}/roles`, data)
      .then((r) => r.data);
  },

  deactivate(userId: number) {
    return apiClient.delete(`/api/users/${userId}`);
  },
};
