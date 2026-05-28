import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

// API_URL should already include /api/v1 from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Ensure no double slashes and correct base URL
const baseURL = API_URL.endsWith('/api/v1') ? API_URL : `${API_URL}/api/v1`;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// Add token to requests from auth store
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const authStore = useAuthStore.getState();
        authStore.clearAuth(); // Use synchronous clear for interceptor
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
