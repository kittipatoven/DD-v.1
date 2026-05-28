import api from './api';

export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  user_id: number;
  total_price: number;
  status?: string;
  shipping_address?: string;
  phone?: string;
  notes?: string;
  items: OrderItem[];
  slip_image?: string;
}

export interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  shipping_address: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export const orderApi = {
  createOrder: async (data: CreateOrderData) => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getOrderById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  getAllOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateOrder: async (id: number, data: Partial<CreateOrderData>) => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id: number) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};
