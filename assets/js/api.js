/**
 * Great Goals Lifestyle — API Client
 * assets/js/api.js
 * Bridges frontend actions directly to persistent backend REST endpoints
 */

const API = {
  BASE_URL: (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file'))
    ? window.location.origin
    : 'http://localhost:5000',

  async request(endpoint, options = {}) {
    const url = this.BASE_URL + endpoint;
    const headers = options.headers || {};

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
        const errorMsg = (data && data.error) || (data && data.msg) || res.statusText || 'Server error';
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
