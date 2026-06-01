// Order entity — pure domain, no framework dependencies

export interface OrderItem {
  id: number;
  orderId: string;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  // Joined fields
  product?: {
    name?: string;
    mainImage?: string | null;
  };
}

export interface Order {
  id: string; // UUID
  userId: number;
  orderNumber: string; // ORD-YYYYNNNNN
  status: string; // 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
  createdAt: Date;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
