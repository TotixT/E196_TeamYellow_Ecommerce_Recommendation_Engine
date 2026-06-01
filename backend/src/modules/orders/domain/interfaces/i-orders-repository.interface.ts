import { Order, OrderWithItems } from '../entities/order.entity';

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CheckoutData {
  userId: number;
  cartId: number;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;
}

export interface IOrdersRepository {
  /**
   * Atomic checkout transaction:
   * 1. Validates stock for all items
   * 2. Decrements stock
   * 3. Creates the Order + OrderItems
   * 4. Marks cart as 'converted'
   * 5. Generates ORD-YYYYNNNNN
   */
  checkout(data: CheckoutData): Promise<OrderWithItems>;

  findUserOrders(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedOrders>;
  findAllOrders(page: number, limit: number): Promise<PaginatedOrders>;

  findById(orderId: string): Promise<OrderWithItems | null>;
}
