import api from './api';

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  create: async (data: {
    name: string;
    description: string;
  }): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  update: async (id: number, data: {
    name?: string;
    description?: string;
  }): Promise<Category> => {
    const response = await api.patch<Category>(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
