// Cart entity — pure domain, no framework dependencies

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  addedAt: Date;
  // Joined fields (optional, populated when fetching cart details)
  productName?: string;
  productImage?: string;
  productStock?: number;
}

export interface Cart {
  id: number;
  userId: number | null;
  sessionId: string | null;
  status: string; // 'active' | 'converted' | 'abandoned'
  createdAt: Date;
  updatedAt: Date;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
