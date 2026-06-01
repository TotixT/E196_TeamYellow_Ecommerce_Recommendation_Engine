import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ── Request Interceptor: Attach JWT and Session ID ──
api.interceptors.request.use((config) => {
  // If data is FormData, ensure no default Content-Type is sent
  // so the browser sets multipart/form-data with the correct boundary
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    } else {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  }

  // Attach Bearer token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eie_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach anonymous session ID for recommendations tracking
    const sessionId = localStorage.getItem('eie_session_id');
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
  }
  return config;
});

// ── Response Interceptor: Handle 401 (expired token) ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('eie_token');
      localStorage.removeItem('eie_user');

      // Only redirect if not already on login/register pages
      const path = window.location.pathname;
      if (!path.startsWith('/login') && !path.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
