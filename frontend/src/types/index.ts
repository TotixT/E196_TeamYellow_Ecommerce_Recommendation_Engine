// ═══════════════════════════════════════════════
// EIE Types — Matches Backend API Responses
// ═══════════════════════════════════════════════

// ── Auth ─────────────────────────────────────────
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

// ── Products ─────────────────────────────────────
export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  cloudinaryPublicId: string;
  order: number;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  status: 'active' | 'inactive';
  mainImage?: string | null;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  images?: ProductImage[];
  categoryName?: string;
  categorySlug?: string;
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Categories ───────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Cart ─────────────────────────────────────────
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  subtotal: number | string;
  itemCount: number;
}

// ── Orders ───────────────────────────────────────
export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
  product?: Product;
}

export interface Order {
  id: string;
  userId: number;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number | string;
  shippingCost: number | string;
  total: number | string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPhone?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

// ── Recommendations ──────────────────────────────
export interface Recommendation extends Product {}

// ── Admin Reports ────────────────────────────────
export interface MonthlyData {
  month: number;
  monthName: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface MonthlySalesReport {
  year: number;
  months: MonthlyData[];
  totalAccumulated: number;
}

export interface TopProduct {
  id: number;
  name: string;
  mainImage: string | null;
  price: number | string;
  categoryName: string;
  unitsSold: number;
  revenue: number | string;
}

export interface TopUser {
  id: number;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number | string;
}

export interface ConversionData {
  period: string;
  dateRange: { from: string; to: string };
  totalSessions: number;
  totalPurchaseSessions: number;
  conversionRate: number;
  monthlyTrend: {
    month: number;
    monthName: string;
    sessions: number;
    purchases: number;
    rate: number;
  }[];
}

// ── Helpers ──────────────────────────────────────
export function formatCOP(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function toNumber(value: number | string): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}
