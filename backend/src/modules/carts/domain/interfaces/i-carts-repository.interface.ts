import { Cart, CartItem, CartWithItems } from '../entities/cart.entity';

export interface ICartsRepository {
  findActiveCart(
    userId: number | null,
    sessionId: string | null,
  ): Promise<Cart | null>;
  createCart(userId: number | null, sessionId: string | null): Promise<Cart>;
  getCartWithItems(cartId: number): Promise<CartWithItems | null>;

  // Item operations
  findItemByProduct(
    cartId: number,
    productId: number,
  ): Promise<CartItem | null>;
  findItemById(itemId: number): Promise<CartItem | null>;
  addItem(data: {
    cartId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
  }): Promise<CartItem>;
  updateItemQuantity(itemId: number, quantity: number): Promise<CartItem>;
  removeItem(itemId: number): Promise<void>;

  // Cart lifecycle
  mergeAnonymousCart(sessionId: string, userId: number): Promise<void>;
  markAsConverted(cartId: number): Promise<void>;

  // Product lookup (avoid cross-module coupling)
  findProductById(productId: number): Promise<{
    id: number;
    name: string;
    price: number;
    stock: number;
    status: string;
    mainImage: string | null;
  } | null>;
}
