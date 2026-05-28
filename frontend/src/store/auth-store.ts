import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, AuthResponse } from '@/lib/auth-api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearAuth: () => void; // Synchronous clear for interceptors
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set): AuthState => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ name, email, password });
          set({
            user: response.user,
            token: response.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        // Call API first (fire and forget)
        await authApi.logout();

        // Then clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        // Synchronous clear for API interceptors
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token, isAuthenticated: !!token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
