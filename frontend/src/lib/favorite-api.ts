import api from './api';

export interface Favorite {
  id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  product?: {
    id: number;
    name: string;
    price: string;
    images?: any[];
  };
}

export const favoriteApi = {
  getMyFavorites: async (): Promise<Favorite[]> => {
    const response = await api.get<Favorite[]>('/favorites');
    return response.data;
  },

  addFavorite: async (productId: number): Promise<Favorite> => {
    const response = await api.post<Favorite>(`/favorites/${productId}`);
    return response.data;
  },

  removeFavorite: async (productId: number): Promise<void> => {
    await api.delete(`/favorites/${productId}`);
  },

  checkFavorite: async (productId: number): Promise<boolean> => {
    const response = await api.get<{ isFavorite: boolean }>(`/favorites/check/${productId}`);
    return response.data.isFavorite;
  },
};
