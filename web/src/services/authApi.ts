import { apiRequest } from './httpClient';
import type { AuthResponse } from '../types/auth';

export const authApi = {
  register(input: { name: string; email: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: input,
      skipAuthHeader: true,
    });
  },

  login(input: { email: string; password: string }) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: input,
      skipAuthHeader: true,
    });
  },

  refresh(refreshToken: string) {
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      skipAuthHeader: true,
      skipAuthRetry: true,
    });
  },

  logout(refreshToken: string) {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
      body: { refreshToken },
      skipAuthRetry: true,
    });
  },

  forgotPassword(email: string) {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuthHeader: true,
    });
  },

  verifyCode(email: string, code: string) {
    return apiRequest<{ valid: boolean }>('/auth/verify-code', {
      method: 'POST',
      body: { email, code },
      skipAuthHeader: true,
    });
  },

  resetPassword(email: string, code: string, newPassword: string) {
    return apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, code, newPassword },
      skipAuthHeader: true,
    });
  },
};
