const API_BASE = window.location.origin + '/api';

const api = {
  token: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isRefreshing: false,
  refreshSubscribers: [],

  onRefreshed(token) {
    this.refreshSubscribers.map(cb => cb(token));
    this.refreshSubscribers = [];
  },

  addRefreshSubscriber(cb) {
    this.refreshSubscribers.push(cb);
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      // Handle token refresh on 401
      if (response.status === 401 && this.refreshToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshAccessToken().then(refreshed => {
            this.isRefreshing = false;
            this.onRefreshed(refreshed ? this.token : null);
          });
        }

        return new Promise((resolve, reject) => {
          this.addRefreshSubscriber(async (token) => {
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
              try {
                const retryResponse = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
                const retryContentType = retryResponse.headers.get('content-type');
                if (retryContentType && retryContentType.includes('application/json')) {
                  resolve(await retryResponse.json());
                } else if (!retryResponse.ok) {
                  reject(new Error(`Lỗi kết nối đến máy chủ (${retryResponse.status})`));
                } else {
                  resolve({});
                }
              } catch (err) {
                reject(err);
              }
            } else {
              reject(new Error('Phiên đăng nhập đã hết hạn'));
            }
          });
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (!response.ok) {
        throw new Error(`Lỗi kết nối đến máy chủ (${response.status})`);
      }
      return {};
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.token = data.data.accessToken;
          this.refreshToken = data.data.refreshToken;
          localStorage.setItem('accessToken', this.token);
          localStorage.setItem('refreshToken', this.refreshToken);
          return true;
        }
      }

      // Refresh failed, clear tokens
      this.logout();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  },

  // Auth endpoints
  async login(username, password) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (result.success) {
      this.token = result.data.accessToken;
      this.refreshToken = result.data.refreshToken;
      localStorage.setItem('accessToken', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('tm_user', JSON.stringify(result.data.user));
      localStorage.setItem('tm_role', result.data.user.role);
    }

    return result;
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tm_user');
    localStorage.removeItem('tm_role');
  },

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  // Destinations endpoints
  async getDestinations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/destinations?${queryString}`);
  },

  async getDestination(idOrSlug) {
    return this.request(`/destinations/${idOrSlug}`);
  },

  async getNearbyDestinations(lat, lng, radius = 5000) {
    return this.request(`/destinations/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
  },

  async createDestination(data) {
    return this.request('/destinations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateDestination(id, data) {
    return this.request(`/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteDestination(id) {
    return this.request(`/destinations/${id}`, {
      method: 'DELETE'
    });
  },

  async submitDestinationForReview(id) {
    return this.request(`/destinations/${id}/submit-review`, {
      method: 'POST'
    });
  },

  async approveDestination(id, comment = '') {
    return this.request(`/destinations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  },

  async rejectDestination(id, reason) {
    return this.request(`/destinations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  async getDestinationComments(id) {
    return this.request(`/destinations/${id}/comments`);
  },

  async addDestinationComment(id, comment, action = 'comment') {
    return this.request(`/destinations/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, action })
    });
  },

  // Routes endpoints
  async getRoutes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/routes?${queryString}`);
  },

  async getRoute(idOrSlug) {
    return this.request(`/routes/${idOrSlug}`);
  },

  async createRoute(data) {
    return this.request('/routes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateRoute(id, data) {
    return this.request(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteRoute(id) {
    return this.request(`/routes/${id}`, {
      method: 'DELETE'
    });
  },

  async addRouteStop(routeId, stopData) {
    return this.request(`/routes/${routeId}/stops`, {
      method: 'POST',
      body: JSON.stringify(stopData)
    });
  },

  async updateRouteStop(routeId, stopId, data) {
    return this.request(`/routes/${routeId}/stops/${stopId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteRouteStop(routeId, stopId) {
    return this.request(`/routes/${routeId}/stops/${stopId}`, {
      method: 'DELETE'
    });
  },

  async submitRouteForReview(id) {
    return this.request(`/routes/${id}/submit-review`, {
      method: 'POST'
    });
  },

  async approveRoute(id, comment = '') {
    return this.request(`/routes/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  },

  async rejectRoute(id, reason) {
    return this.request(`/routes/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Events endpoints
  async getEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/events?${queryString}`);
  },

  async getEvent(idOrSlug) {
    return this.request(`/events/${idOrSlug}`);
  },

  async getUpcomingEvents(limit = 10) {
    return this.request(`/events/upcoming?limit=${limit}`);
  },

  async createEvent(data) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateEvent(id, data) {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  async submitEventForReview(id) {
    return this.request(`/events/${id}/submit-review`, {
      method: 'POST'
    });
  },

  async approveEvent(id, comment = '') {
    return this.request(`/events/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
  },

  async rejectEvent(id, reason) {
    return this.request(`/events/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  // Users endpoints (admin only)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users?${queryString}`);
  },

  async getUser(id) {
    return this.request(`/users/${id}`);
  },

  async createUser(data) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateUser(id, data) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  async updateUserStatus(id, status) {
    return this.request(`/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  async updateUserRole(id, role) {
    return this.request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  // i18n endpoints
  async getTranslations(page, lang = null) {
    const endpoint = lang ? `/i18n/${page}/${lang}` : `/i18n/${page}`;
    return this.request(endpoint);
  },

  async updateTranslation(page, key, lang, value) {
    return this.request(`/i18n/${page}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ lang, value })
    });
  },

  async bulkUpdateTranslations(page, lang, translations) {
    return this.request('/i18n/bulk', {
      method: 'POST',
      body: JSON.stringify({ page, lang, translations })
    });
  },

  async exportTranslations(lang) {
    return this.request(`/i18n/export/${lang}`);
  },

  async exportAllTranslations() {
    return this.request('/i18n/export/all');
  },

  // File upload endpoints
  async uploadImage(file, category = 'destinations') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      headers,
      body: formData
    });

    return response.json();
  },

  async uploadMultipleImages(files, category = 'destinations') {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    formData.append('category', category);

    const headers = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/upload/images`, {
      method: 'POST',
      headers,
      body: formData
    });

    return response.json();
  },

  async deleteUploadedFile(filename, category = 'destinations') {
    return this.request(`/upload/${filename}?category=${category}`, {
      method: 'DELETE'
    });
  },

  // Comments endpoints
  async getComments(entityType, entityId) {
    return this.request(`/comments/${entityType}/${entityId}`);
  },

  // BUG-11 FIX: Route '/comments' (generic) does not exist on the server.
  // Server only exposes entity-specific comment routes:
  // POST /destinations/:id/comments, /routes/:id/comments, /events/:id/comments
  async addComment(entityType, entityId, comment, action = 'comment') {
    // Map entityType to its plural route segment
    const entityRouteMap = {
      destination: 'destinations',
      route: 'routes',
      event: 'events'
    };
    const routeSegment = entityRouteMap[entityType] || `${entityType}s`;
    return this.request(`/${routeSegment}/${entityId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, action })
    });
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
}
