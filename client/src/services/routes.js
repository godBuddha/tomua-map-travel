import api from './api.js';

export const RoutesService = {
  async getAll(params = {}) {
    return api.get('/routes', params);
  },

  async getById(idOrSlug) {
    return api.get(`/routes/${idOrSlug}`);
  },

  async create(data) {
    return api.post('/routes', data);
  },

  async update(id, data) {
    return api.put(`/routes/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/routes/${id}`);
  },

  async addStop(routeId, stopData) {
    return api.post(`/routes/${routeId}/stops`, stopData);
  },

  async updateStop(routeId, stopId, data) {
    return api.put(`/routes/${routeId}/stops/${stopId}`, data);
  },

  async deleteStop(routeId, stopId) {
    return api.delete(`/routes/${routeId}/stops/${stopId}`);
  },

  async submitForReview(id) {
    return api.post(`/routes/${id}/submit-review`, {});
  },

  async approve(id, comment = '') {
    return api.post(`/routes/${id}/approve`, { comment });
  },

  async reject(id, reason) {
    return api.post(`/routes/${id}/reject`, { reason });
  }
};
