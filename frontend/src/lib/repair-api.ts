import api from './api';
import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

export interface Repair {
  id: number;
  title: string;
  description?: string;
  device_type?: string;
  status: 'completed' | 'in_progress' | 'pending';
  created_by?: number;
  created_at: string;
  updated_at: string;
  images?: RepairImage[];
  createdBy?: any;
}

export interface RepairImage {
  id: number;
  repair_id: number;
  image_url: string;
  image_type: 'before' | 'after' | 'during';
  caption?: string;
  created_at: string;
}

export interface RepairsResponse {
  repairs: Repair[];
  total: number;
}

export const repairApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<RepairsResponse> => {
    const response = await api.get<RepairsResponse>('/repairs', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Repair> => {
    const response = await api.get<Repair>(`/repairs/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    device_type?: string;
    status?: 'completed' | 'in_progress' | 'pending';
    images?: { image_url: string; image_type?: 'before' | 'after' | 'during'; caption?: string }[];
  }): Promise<Repair> => {
    const response = await api.post<Repair>('/repairs', data);
    return response.data;
  },

  update: async (id: number, data: {
    title?: string;
    description?: string;
    device_type?: string;
    status?: 'completed' | 'in_progress' | 'pending';
    images?: { image_url: string; image_type?: 'before' | 'after' | 'during'; caption?: string }[];
  }): Promise<Repair> => {
    const response = await api.patch<Repair>(`/repairs/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/repairs/${id}`);
  },

  createWithImages: async (data: {
    title: string;
    description?: string;
    device_type?: string;
    status?: 'completed' | 'in_progress' | 'pending';
    images: File[];
  }): Promise<Repair> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.device_type) formData.append('device_type', data.device_type);
    if (data.status) formData.append('status', data.status);
    
    data.images.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
      const baseUrl = rawApiUrl.replace(/\/api\/v1\/?$/, '');

      const uploadApi = axios.create({
        baseURL: `${baseUrl}/api/v1`,
      });

      const authStore = useAuthStore.getState();
      const token = authStore.token;
      if (token) {
        uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        throw new Error('กรุณา login ก่อนอัปโหลดรูป');
      }

      const response = await uploadApi.post<Repair>('/repairs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        throw new Error('กรุณา login เป็น admin ก่อนสร้างรายการซ่อม');
      }
      throw error;
    }
  },
};
