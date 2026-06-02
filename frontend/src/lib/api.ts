import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { getApiBaseUrl } from '@/lib/env';

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.baseURL = getApiBaseUrl();
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const authStore = useAuthStore.getState();
        authStore.clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
