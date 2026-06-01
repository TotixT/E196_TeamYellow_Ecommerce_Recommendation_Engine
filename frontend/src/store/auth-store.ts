'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import type { User, LoginResponse } from '@/types';
import { useCartStore } from './cart-store';

// Generate a unique anonymous session ID for recommendation tracking
function generateSessionId(): string {
  return `anon-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface AuthState {
  token: string | null;
  user: User | null;
  sessionId: string;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; email: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string }>;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      sessionId: generateSessionId(),
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
          const user = data.user;
          // The backend returns accessToken, not token
          const token = data.accessToken;

          // Persist token for the interceptor
          localStorage.setItem('eie_token', token);
          localStorage.setItem('eie_user', JSON.stringify(user));

          set({
            token,
            user,
            isAuthenticated: true,
            isAdmin: user.role === 'admin',
            isLoading: false,
          });

          // EIE-006: Merge anonymous cart with user cart
          try {
            await api.post(API_ENDPOINTS.CART.MERGE);
            await useCartStore.getState().fetchCart();
          } catch (mergeErr) {
            console.error('Failed to merge cart after login:', mergeErr);
          }
        } catch (err: any) {
          let message = 'Error desconocido del servidor.';
          if (err.response?.data) {
            const dataMsg = err.response.data.message || err.response.data.error;
            message = Array.isArray(dataMsg) ? dataMsg.join(', ') : dataMsg;
          } else if (err.message) {
            message = err.message;
          }
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      register: async (fullName: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.post(API_ENDPOINTS.AUTH.REGISTER, { fullName, email, password });
          set({ isLoading: false });
        } catch (err: any) {
          let message = 'Error desconocido del servidor.';
          if (err.response?.data) {
            const dataMsg = err.response.data.message || err.response.data.error;
            message = Array.isArray(dataMsg) ? dataMsg.join(', ') : dataMsg;
          } else if (err.message) {
            message = err.message;
          }
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch {
          // Logout even if API call fails
        }
        localStorage.removeItem('eie_token');
        localStorage.removeItem('eie_user');
        useCartStore.getState().clearCart();
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
          sessionId: generateSessionId(),
          _hasHydrated: true,
        });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
          set({ isLoading: false });
          return data;
        } catch (err: any) {
          const message = err.response?.data?.message || 'Error al solicitar la recuperación.';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      resetPassword: async (token: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
          set({ isLoading: false });
          return data;
        } catch (err: any) {
          const message = err.response?.data?.message || 'Error al restablecer la contraseña.';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'eie-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        sessionId: state.sessionId,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        // Re-set token in localStorage for the API interceptor after hydration
        if (state?.token) {
          localStorage.setItem('eie_token', state.token);
        }
        if (state?.sessionId) {
          localStorage.setItem('eie_session_id', state.sessionId);
        }
        if (state) {
          state._hasHydrated = true;
        }
      },
    },
  ),
);
