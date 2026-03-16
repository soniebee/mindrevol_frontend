// src/lib/http.ts
import axios from 'axios';

// Accept both env formats:
// - http://localhost:8080
// - http://localhost:8080/api/v1
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').trim();
const normalizedBase = rawApiUrl.replace(/\/+$/, '');

// 1. Define URL constants and export them
// DOMAIN: Base server URL (used for socket, static assets, etc.)
export const DOMAIN = normalizedBase.endsWith('/api/v1')
  ? normalizedBase.replace(/\/api\/v1$/, '')
  : normalizedBase;
export const API_URL = normalizedBase.endsWith('/api/v1')
  ? normalizedBase
  : `${normalizedBase}/api/v1`;
// ...

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. REQUEST INTERCEPTOR ---
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- 2. RESPONSE INTERCEPTOR (Refresh Token Logic) ---
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If refresh endpoint itself returns 401 -> force logout
      if (originalRequest.url.includes('/auth/refresh-token')) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Use plain axios for refresh request to avoid interceptor loops
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        // Backend may or may not return a new refresh token
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        http.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

        processQueue(null, accessToken);
        isRefreshing = false;

        return http(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);