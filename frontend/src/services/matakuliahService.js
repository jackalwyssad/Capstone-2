import api from './api';

/**
 * Service API Mata Kuliah & Jadwal Perkuliahan
 * Berkomunikasi dengan endpoint /api/v1/matakuliah pada database.
 */
export const matakuliahService = {
  getMatakuliah: async (params = {}) => {
    const response = await api.get('/matakuliah', { params });
    return response.data;
  },

  getAllMatakuliah: async (params = {}) => {
    const response = await api.get('/matakuliah', { params: { ...params, all: true } });
    return response.data;
  },

  getMatakuliahById: async (id) => {
    const response = await api.get(`/matakuliah/${id}`);
    return response.data;
  },

  createMatakuliah: async (data) => {
    const response = await api.post('/matakuliah', data);
    return response.data;
  },

  updateMatakuliah: async (id, data) => {
    const response = await api.put(`/matakuliah/${id}`, data);
    return response.data;
  },

  deleteMatakuliah: async (id) => {
    const response = await api.delete(`/matakuliah/${id}`);
    return response.data;
  },
};
