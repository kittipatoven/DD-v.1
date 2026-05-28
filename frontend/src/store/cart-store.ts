import { create } from 'zustand';
import { Cart, CartItem, cartApi, AddToCartDto } from '@/lib/cart-api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;

  // Actions
  loadCart: (userId: number) => Promise<void>;
  addToCart: (userId: number, data: AddToCartDto) => Promise<void>;
  updateCartItem: (itemId: number, data: AddToCartDto) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: (userId: number) => Promise<void>;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  loadCart: async (userId: number) => {
    set({ isLoading: true });
    try {
      const cart = await cartApi.getUserCart(userId);
      set({ cart, isLoading: false });
    } catch (error) {
      console.error('Failed to load cart:', error);
      set({ isLoading: false });
    }
  },

  addToCart: async (userId: number, data: AddToCartDto) => {
    try {
      await cartApi.addToCart(userId, data);
      await get().loadCart(userId);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  },

  updateCartItem: async (itemId: number, data: AddToCartDto) => {
    try {
      await cartApi.updateCartItem(itemId, data);
      const { cart } = get();
      if (cart) {
        const updatedItems = cart.items.map((item) =>
          item.id === itemId ? { ...item, quantity: data.quantity } : item
        );
        set({ cart: { ...cart, items: updatedItems } });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
    }
  },

  removeCartItem: async (itemId: number) => {
    try {
      await cartApi.removeCartItem(itemId);
      const { cart } = get();
      if (cart) {
        const updatedItems = cart.items.filter((item) => item.id !== itemId);
        set({ cart: { ...cart, items: updatedItems } });
      }
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    }
  },

  clearCart: async (userId: number) => {
    try {
      await cartApi.clearCart(userId);
      set({ cart: null });
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  },

  getCartTotal: () => {
    const { cart } = get();
    if (!cart) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity;
    }, 0);
  },
}));
