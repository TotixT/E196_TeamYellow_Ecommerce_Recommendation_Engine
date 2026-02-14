// TODO: Define shared TypeScript types
// TODO: Define API response interfaces
// TODO: Define domain entity types

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}
