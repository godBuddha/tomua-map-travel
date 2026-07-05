// Centralized API Client
const API_BASE = '/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tm_user');
    localStorage.removeItem('tm_role');
  }

  isAuthenticated() {
    return !!this.token;
  }

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

      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.token}`;
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
          });
          return this.handleResponse(retryResponse);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    if (response.status === 204) {
      return { success: true };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return {};
  }

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
          this.setTokens(data.data.accessToken, data.data.refreshToken);
          return true;
        }
      }

      this.clearTokens();
      return false;
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  // Generic CRUD
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth
  async login(username, password) {
    const result = await this.post('/auth/login', { username, password });
    if (result.success && result.data?.accessToken) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
      localStorage.setItem('tm_user', JSON.stringify(result.data.user));
      localStorage.setItem('tm_role', result.data.user.role);
    }
    return result;
  }

  async logout() {
    try { await this.post('/auth/logout', {}); } catch (e) {}
    this.clearTokens();
  }
}

const api = new ApiClient();
export default api;
