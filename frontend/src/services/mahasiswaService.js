import api from './api';

/**
 * Service API Mahasiswa
 * Mengurus CRUD Mahasiswa, pencarian, filter, dan impor massal dari file JSON/Excel.
 */
export const mahasiswaService = {
  getMahasiswa: async (params = {}) => {
    const response = await api.get('/mahasiswa', { params });
    return response.data;
  },

  getMahasiswaById: async (id) => {
    const response = await api.get(`/mahasiswa/${id}`);
    return response.data;
  },

  createMahasiswa: async (data) => {
    const response = await api.post('/mahasiswa', data);
    return response.data;
  },

  updateMahasiswa: async (id, data) => {
    const response = await api.put(`/mahasiswa/${id}`, data);
    return response.data;
  },

  deleteMahasiswa: async (id) => {
    const response = await api.delete(`/mahasiswa/${id}`);
    return response.data;
  },

  importMahasiswa: async (payload) => {
    const response = await api.post('/mahasiswa/import', payload);
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await api.post(`/mahasiswa/${id}/reset-password`);
    return response.data;
  },

  generateNim: async (prodi, angkatan) => {
    const response = await api.get('/mahasiswa/generate-nim', {
      params: { prodi, angkatan },
    });
    return response.data;
  },
};
