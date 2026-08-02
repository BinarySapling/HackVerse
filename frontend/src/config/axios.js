import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (error, token = null) => {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  pendingRequests = [];
};

const clearSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  const publicPaths = [
    '/login',
    '/signup',
    '/',
    '/forgot-password',
    '/reset-password',
    '/judge/register',
    '/hackathons',
    '/verify-email',
  ];
  const path = window.location.pathname;
  const isPublic =
    publicPaths.includes(path) ||
    path.startsWith('/hackathons/') ||
    path.startsWith('/judge/register') ||
    path.startsWith('/verify-email');
  if (!isPublic) {
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't try refresh on login/signup/refresh themselves
      const url = originalRequest.url || '';
      if (url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh')) {
        const message = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(new Error(message));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data?.data?.accessToken;
        if (!newToken) {
          throw new Error('No access token from refresh');
        }
        localStorage.setItem('token', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSessionAndRedirect();
        return Promise.reject(
          new Error(refreshError.response?.data?.message || 'Session expired. Please login again.')
        );
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Make sure the backend is running.'
        : 'Something went wrong');
    const enriched = new Error(message);
    enriched.status = error.response?.status;
    enriched.errorCode = error.response?.data?.errorCode;
    enriched.data = error.response?.data?.data || null;
    return Promise.reject(enriched);
  }
);

export default api;
