import api from './api';

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product?: any;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  items: CartItem[];
}

export interface AddToCartDto {
  product_id: number;
  quantity: number;
}

export const cartApi = {
  // ดึง cart ของ user
  getUserCart: async (userId: number): Promise<Cart> => {
    const response = await api.get(`/carts/user/${userId}`);
    return response.data;
  },

  // เพิ่มสินค้าลงใน cart
  addToCart: async (userId: number, data: AddToCartDto): Promise<CartItem> => {
    const response = await api.post(`/carts/user/${userId}/add`, data);
    return response.data;
  },

  // อัปเดต quantity ของ cart item
  updateCartItem: async (itemId: number, data: AddToCartDto): Promise<CartItem> => {
    const response = await api.put(`/carts/items/${itemId}`, data);
    return response.data;
  },

  // ลบ cart item
  removeCartItem: async (itemId: number): Promise<void> => {
    await api.delete(`/carts/items/${itemId}`);
  },

  // ล้าง cart
  clearCart: async (userId: number): Promise<void> => {
    await api.delete(`/carts/user/${userId}/clear`);
  },

  // คำนวณราคารวมใน cart
  getCartTotal: async (userId: number): Promise<number> => {
    const response = await api.get(`/carts/user/${userId}/total`);
    return response.data.total;
  },
};
