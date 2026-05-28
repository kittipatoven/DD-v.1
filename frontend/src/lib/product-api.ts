import api from './api';
import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category_id: number;
  stock: number;
  status: string;
  created_at: string;
  category?: any;
  images?: any[];
  reviews?: any[];
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export const productApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
    type?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  search: async (keyword: string): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products/search', {
      params: { keyword },
    });
    return response.data;
  },

  create: async (data: {
    name: string;
    description: string;
    price: number;
    category_id: number;
    stock: number;
    status?: string;
  }): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },

  update: async (id: number, data: {
    name?: string;
    description?: string;
    price?: number;
    category_id?: number;
    stock?: number;
    status?: string;
  }): Promise<Product> => {
    const response = await api.patch<Product>(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    console.log('[DEBUG API] Uploading file:', file.name, file.size, file.type);
    console.log('[DEBUG API] FormData entries:', Array.from(formData.entries()));

    try {
      // Get base API URL without /api/v1 suffix for upload endpoint
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const baseUrl = rawApiUrl.replace(/\/api\/v1\/?$/, ''); // Remove /api/v1 if present

      // Create a separate axios instance for upload to avoid default Content-Type
      const uploadApi = axios.create({
        baseURL: `${baseUrl}/api/v1`,
        headers: {
          // Don't set Content-Type - let browser set it to multipart/form-data automatically
        },
      });

      // Add auth token from auth store
      const authStore = useAuthStore.getState();
      const token = authStore.token;
      console.log('[DEBUG API] Token:', token ? 'Found' : 'Not found');
      console.log('[DEBUG API] User:', authStore.user ? authStore.user.email : 'Not logged in');
      if (token) {
        uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        console.error('[DEBUG API] No token found - user not logged in');
        throw new Error('กรุณา login ก่อนอัปโหลดรูป');
      }

      const response = await uploadApi.post<{ url: string; filename: string }>('/products/upload', formData);
      console.log('[DEBUG API] Upload response:', response.data);
      console.log('[DEBUG API] Response status:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('[DEBUG API] Upload error:', error);
      console.error('[DEBUG API] Error response:', error.response);
      console.error('[DEBUG API] Error message:', error.message);
      console.error('[DEBUG API] Error status:', error.response?.status);
      console.error('[DEBUG API] Error data:', error.response?.data);

      // Check if it's an authentication error
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('กรุณา login เป็น admin ก่อนอัปโหลดรูป');
      }

      throw error;
    }
  },
};
