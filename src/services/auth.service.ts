import apiClient from '@/lib/api-client';
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  RefreshTokenRequestDTO,
} from '@/types/api';

export const authService = {
  login(data: LoginRequestDTO) {
    return apiClient.post<LoginResponseDTO>('/api/auth/login', data).then((r) => r.data);
  },

  register(data: RegisterRequestDTO) {
    return apiClient.post<LoginResponseDTO>('/api/auth/register', data).then((r) => r.data);
  },

  refresh(data: RefreshTokenRequestDTO) {
    return apiClient.post<LoginResponseDTO>('/api/auth/refresh', data).then((r) => r.data);
  },

  logout(refreshToken: string) {
    return apiClient.post('/api/auth/logout', { refreshToken });
  },
};
