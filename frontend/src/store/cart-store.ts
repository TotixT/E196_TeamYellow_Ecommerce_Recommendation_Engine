'use client';

import { create } from 'zustand';
import api from '@/services/api';
import { API_ENDPOINTS } from '@/config/api-endpoints';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Cart, CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;

  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => void;
  clearError: () => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await api.get<any>(API_ENDPOINTS.CART.BASE);
      set({
        items: data.items || [],
        subtotal: data.totalPrice || 0,
        itemCount: data.totalItems || 0,
        isLoading: false,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({ isLoading: false, error: err.response?.data?.message || 'Error al cargar el carrito.' });
    }
  },

  addToCart: async (productId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(API_ENDPOINTS.CART.ITEMS, { productId, quantity });
      await get().fetchCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('[CartStore] addToCart error:', err);
      let message = 'Error al agregar al carrito.';
      if (err.response?.data) {
        const dataMsg = err.response.data.message || err.response.data.error;
        message = Array.isArray(dataMsg) ? dataMsg.join(', ') : (dataMsg || message);
      } else if (err.message) {
        message = err.message;
      }
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(API_ENDPOINTS.CART.ITEM(itemId), { quantity });
      await get().fetchCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('[CartStore] updateQuantity error:', err);
      let message = 'Error al actualizar.';
      if (err.response?.data) {
        const dataMsg = err.response.data.message || err.response.data.error;
        message = Array.isArray(dataMsg) ? dataMsg.join(', ') : (dataMsg || message);
      } else if (err.message) {
        message = err.message;
      }
      set({ isLoading: false, error: message });
    }
  },

  removeItem: async (itemId: number) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API_ENDPOINTS.CART.ITEM(itemId));
      await get().fetchCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('[CartStore] removeItem error:', err);
      let message = 'Error al eliminar.';
      if (err.response?.data) {
        const dataMsg = err.response.data.message || err.response.data.error;
        message = Array.isArray(dataMsg) ? dataMsg.join(', ') : (dataMsg || message);
      } else if (err.message) {
        message = err.message;
      }
      set({ isLoading: false, error: message });
    }
  },

  clearCart: () => set({ items: [], subtotal: 0, itemCount: 0 }),
  clearError: () => set({ error: null }),
}));
