import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Service Axios Central API Client
 * Mengatur instance HTTP request ke backend Laravel API (http://127.0.0.1:8000/api/v1).
 * Otomatis melampirkan header Authorization Bearer token dari Zustand authStore.
 * Mengontrol penanganan error global (401 Unauthorized -> Logout, 403 Forbidden, 500 Server Error).
 */
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor Request: Otomatis sisipkan Bearer Token Sanctum
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Tangani HTTP error status code global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Jika token kedaluwarsa atau tidak valid (401), lakukan auto logout
      if (status === 401) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Jika akses ditolak (403), redirect ke halaman 403 jika belum di sana
      if (status === 403 && !window.location.pathname.startsWith('/403')) {
        // opsional: window.location.href = '/403';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
