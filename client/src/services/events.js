import api from './api.js';

export const EventsService = {
  async getAll(params = {}) {
    return api.get('/events', params);
  },

  async getById(idOrSlug) {
    return api.get(`/events/${idOrSlug}`);
  },

  async getUpcoming(limit = 10) {
    return api.get('/events/upcoming', { limit });
  },

  async create(data) {
    return api.post('/events', data);
  },

  async update(id, data) {
    return api.put(`/events/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/events/${id}`);
  },

  async submitForReview(id) {
    return api.post(`/events/${id}/submit-review`, {});
  },

  async approve(id, comment = '') {
    return api.post(`/events/${id}/approve`, { comment });
  },

  async reject(id, reason) {
    return api.post(`/events/${id}/reject`, { reason });
  }
};
