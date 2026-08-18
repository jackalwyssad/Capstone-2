import api from './api';

/**
 * Service API Dashboard
 * Mengambil data ringkasan statistik dan grafik analitik Recharts sesuai role yang sedang aktif.
 */
export const dashboardService = {
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getDosenDashboard: async () => {
    const response = await api.get('/dashboard/dosen');
    return response.data;
  },

  getMahasiswaDashboard: async () => {
    const response = await api.get('/dashboard/mahasiswa');
    return response.data;
  },
};
