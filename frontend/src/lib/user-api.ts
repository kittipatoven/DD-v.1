import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export const userApi = {
  getAllUsers: async (page: number = 1, limit: number = 20): Promise<PaginatedUsersResponse> => {
    const response = await api.get<PaginatedUsersResponse>(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  banUser: async (userId: number): Promise<void> => {
    await api.patch(`/users/${userId}/ban`);
  },

  unbanUser: async (userId: number): Promise<void> => {
    await api.patch(`/users/${userId}/unban`);
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  updateRole: async (userId: number, role: 'admin' | 'user'): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}/role`, { role });
    return response.data;
  },
};
