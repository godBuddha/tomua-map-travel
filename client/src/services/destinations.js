import api from './api.js';

export const DestinationsService = {
  async getAll(params = {}) {
    return api.get('/destinations', params);
  },

  async getById(idOrSlug) {
    return api.get(`/destinations/${idOrSlug}`);
  },

  async getNearby(lat, lng, radius = 5000) {
    return api.get('/destinations/nearby', { lat, lng, radius });
  },

  async create(data) {
    return api.post('/destinations', data);
  },

  async update(id, data) {
    return api.put(`/destinations/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/destinations/${id}`);
  },

  async submitForReview(id) {
    return api.post(`/destinations/${id}/submit-review`, {});
  },

  async requestDelete(id) {
    return api.post(`/destinations/${id}/request-delete`, {});
  },

  async approve(id, comment = '') {
    return api.post(`/destinations/${id}/approve`, { comment });
  },

  async reject(id, reason) {
    return api.post(`/destinations/${id}/reject`, { reason });
  },

  async getComments(id) {
    return api.get(`/destinations/${id}/comments`);
  },

  async addComment(id, comment, action = 'comment') {
    return api.post(`/destinations/${id}/comments`, { comment, action });
  }
};
