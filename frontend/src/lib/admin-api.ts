import api from './api';

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalConversations: number;
  totalViews: number;
}

export interface RecentActivity {
  recentViews: any[];
  recentConversations: any[];
}

export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/admin/activity');
    return response.data;
  },

  trackProductView: async (productId: number) => {
    const response = await api.post('/admin/track-view', { productId });
    return response.data;
  },

  getProductViews: async (productId: number) => {
    const response = await api.get(`/admin/product-views/${productId}`);
    return response.data;
  },
};
