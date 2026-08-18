import api from './api';

/**
 * Service API Perwalian
 * Mengurus pengajuan perwalian oleh Mahasiswa, update status pending, persetujuan/penolakan oleh Dosen, dan ekspor laporan.
 */
export const perwalianService = {
  getPerwalian: async (params = {}) => {
    const response = await api.get('/perwalian', { params });
    return response.data;
  },

  getPerwalianById: async (id) => {
    const response = await api.get(`/perwalian/${id}`);
    return response.data;
  },

  createPerwalian: async (data) => {
    const response = await api.post('/perwalian', data);
    return response.data;
  },

  updatePerwalian: async (id, data) => {
    const response = await api.put(`/perwalian/${id}`, data);
    return response.data;
  },

  deletePerwalian: async (id) => {
    const response = await api.delete(`/perwalian/${id}`);
    return response.data;
  },

  approveRejectPerwalian: async (id, payload) => {
    const response = await api.post(`/perwalian/${id}/approve-reject`, payload);
    return response.data;
  },

  exportExcel: async () => {
    const response = await api.get('/export/perwalian/excel');
    return response.data;
  },
};
