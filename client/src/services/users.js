import api from './api.js';

export const UsersService = {
  async getAll(params = {}) {
    return api.get('/users', params);
  },

  async getById(id) {
    return api.get(`/users/${id}`);
  },

  async getOnline() {
    return api.get('/users/online');
  },

  async create(data) {
    return api.post('/users', data);
  },

  async update(id, data) {
    return api.put(`/users/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/users/${id}`);
  },

  async updateStatus(id, status) {
    return api.put(`/users/${id}/status`, { status });
  },

  async updateRole(id, role) {
    return api.put(`/users/${id}/role`, { role });
  }
};
