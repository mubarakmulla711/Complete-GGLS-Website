/**
 * Great Goals Lifestyle — API Client
 * assets/js/api.js
 * Bridges frontend actions directly to persistent backend REST endpoints
 */

const API = {
  getBaseUrl() {
    if (window.API_BASE_URL) return window.API_BASE_URL;
    // If running directly on the Express server port 5000
    if (window.location && window.location.port === '5000') {
      return window.location.origin;
    }
    // If accessed via Live Server (e.g. port 5500, 3000) or file:///
    const host = (window.location && window.location.hostname && window.location.hostname !== '')
      ? window.location.hostname
      : 'localhost';
    return `http://${host}:5000`;
  },

  getToken() {
    return localStorage.getItem('gg_auth_token') || sessionStorage.getItem('gg_auth_token') || '';
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('gg_auth_token', token);
    } else {
      localStorage.removeItem('gg_auth_token');
      sessionStorage.removeItem('gg_auth_token');
    }
  },

  async request(endpoint, options = {}) {
    const baseUrl = this.getBaseUrl();
    const url = baseUrl + endpoint;
    const headers = options.headers || {};

    // Auto-attach authorization token if available
    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const contentType = res.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg = (data && data.error) || (data && data.msg) || (data && data.message) || res.statusText || 'Server error';
        return { success: false, status: res.status, error: errorMsg, message: errorMsg, data };
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { success: true, status: res.status, ...data, data };
      }
      return { success: true, status: res.status, data };
    } catch (err) {
      console.warn('API fetch warning for', endpoint, err);
      return { success: false, error: err.message, message: err.message, networkError: true };
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    const isForm = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isForm ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    const isForm = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isForm ? body : JSON.stringify(body)
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
