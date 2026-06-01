/**
 * Diccionario centralizado de todos los endpoints de la API (URI Paths).
 * Esta es una excelente práctica para evitar URLs quemadas en el código y facilitar el mantenimiento.
 */

export const API_ENDPOINTS = {
  // ── Auth ──
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // ── Catálogo y Productos (Público) ──
  PRODUCTS: {
    BASE: '/products',
    DETAIL: (id: string | number) => `/products/${id}`,
  },
  CATEGORIES: {
    BASE: '/categories',
    DETAIL: (id: string | number) => `/categories/${id}`,
  },

  // ── Recomendaciones ──
  RECOMMENDATIONS: {
    HOME: '/recommendations/home',
    PRODUCT: (id: string | number) => `/recommendations/product/${id}`,
    TRACK_CLICK: '/recommendations/track-click',
  },

  // ── Carrito ──
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    MERGE: '/cart/merge',
    ITEM: (productId: string | number) => `/cart/items/${productId}`,
  },

  // ── Pedidos (Checkout e Historial) ──
  ORDERS: {
    BASE: '/orders',
    CHECKOUT: '/orders/checkout',
    DETAIL: (id: string | number) => `/orders/${id}`,
  },

  // ── Panel de Administración ──
  ADMIN: {
    // Usuarios
    USERS: {
      BASE: '/admin/users',
      ACTIVATE: (id: string | number) => `/admin/users/${id}/activate`,
      DEACTIVATE: (id: string | number) => `/admin/users/${id}/deactivate`,
    },
    // Categorías
    CATEGORIES: {
      BASE: '/admin/categories',
      DETAIL: (id: string | number) => `/admin/categories/${id}`,
      ACTIVATE: (id: string | number) => `/admin/categories/${id}/activate`,
      DEACTIVATE: (id: string | number) => `/admin/categories/${id}/deactivate`,
    },
    // Productos
    PRODUCTS: {
      BASE: '/admin/products',
      DETAIL: (id: string | number) => `/admin/products/${id}`,
      ACTIVATE: (id: string | number) => `/admin/products/${id}/activate`,
      DEACTIVATE: (id: string | number) => `/admin/products/${id}/deactivate`,
      IMAGES: (id: string | number) => `/admin/products/${id}/images`,
      IMAGE: (productId: string | number, imageId: string | number) => `/admin/products/${productId}/images/${imageId}`,
      IMAGE_PRIMARY: (productId: string | number, imageId: string | number) => `/admin/products/${productId}/images/${imageId}/primary`,
    },
    // Pedidos
    ORDERS: {
      BASE: '/admin/orders',
      DETAIL: (id: string | number) => `/orders/${id}`, // Admin can use the same detail endpoint
    },
    // Reportes
    REPORTS: {
      SALES: '/admin/reports/sales',
      TOP_PRODUCTS: '/admin/reports/top-products',
      TOP_USERS: '/admin/reports/top-users',
      CONVERSION: '/admin/reports/conversion',
    },
    // Recomendaciones
    RECOMMENDATIONS_HISTORY: '/recommendations/history',
  },

  // ── Perfil de Usuario ──
  USERS: {
    ME: '/users/me',
    PASSWORD: '/users/me/password',
  },
} as const;
