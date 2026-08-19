import api from './api';

/**
 * Service API Dosen Wali
 * Mengurus CRUD data Dosen Wali, dropdown list dosen, dan assign dosen wali secara bulk.
 */
export const dosenService = {
  getDosen: async (params = {}) => {
    const response = await api.get('/dosen', { params });
    return response.data;
  },

  getAllList: async () => {
    const response = await api.get('/dosen/all-list');
    return response.data;
  },

  getDosenById: async (id) => {
    const response = await api.get(`/dosen/${id}`);
    return response.data;
  },

  createDosen: async (data) => {
    const response = await api.post('/dosen', data);
    return response.data;
  },

  updateDosen: async (id, data) => {
    const response = await api.put(`/dosen/${id}`, data);
    return response.data;
  },

  deleteDosen: async (id) => {
    const response = await api.delete(`/dosen/${id}`);
    return response.data;
  },

  assignWali: async (payload) => {
    const response = await api.post('/dosen/assign-wali', payload);
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await api.post(`/dosen/${id}/reset-password`);
    return response.data;
  },
};
