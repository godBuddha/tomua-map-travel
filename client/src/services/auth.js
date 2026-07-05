import api from './api.js';

export const AuthService = {
  async login(username, password) {
    return api.login(username, password);
  },

  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async logout() {
    return api.logout();
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async changePassword(currentPassword, newPassword) {
    return api.put('/auth/change-password', { currentPassword, newPassword });
  },

  async refreshToken() {
    return api.refreshAccessToken();
  },

  isAuthenticated() {
    return api.isAuthenticated();
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('tm_user') || '{}');
    } catch {
      return {};
    }
  },

  getRole() {
    return localStorage.getItem('tm_role') || '';
  }
};
