import api from './api';

/**
 * Service API Autentikasi
 * Menyediakan fungsi HTTP request untuk login, register admin, fetch profil (/auth/me), update profil, forgot password, dan logout.
 */
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  registerAdmin: async (data) => {
    const response = await api.post('/auth/register-admin', data);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.post('/auth/profile', data);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('foto', file);
    const response = await api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  verifyResetToken: async (email, token) => {
    const response = await api.get(
      `/auth/verify-reset-token?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
    );
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};
