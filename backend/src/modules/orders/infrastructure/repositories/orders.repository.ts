import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  IOrdersRepository,
  PaginatedOrders,
  CheckoutData,
} from '../../domain/interfaces/i-orders-repository.interface';
import { Order, OrderItem, OrderWithItems } from '../../domain/entities/order.entity';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class OrdersRepository implements IOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * ATOMIC CHECKOUT TRANSACTION
   * This is the most critical operation in the entire e-commerce platform.
   * Uses Prisma Interactive Transactions with serializable isolation
   * to prevent race conditions on stock.
   */
  async checkout(data: CheckoutData): Promise<OrderWithItems> {
    const { userId, cartId, shippingName, shippingAddress, shippingCity, shippingPhone } = data;

    return await this.prisma.$transaction(async (tx) => {
      // 1. Fetch cart items with product data
      const cartItems = await tx.cartItem.findMany({
        where: { cartId },
        include: {
          product: {
            select: { id: true, name: true, price: true, stock: true, mainImage: true },
          },
        },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('El carrito está vacío');
      }

      // 2. Validate stock and calculate totals
      let subtotal = 0;
      const orderItems: {
        productId: number;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        productName: string;
        productImage: string | null;
      }[] = [];

      for (const item of cartItems) {
        // Check stock availability (race condition safe inside transaction)
        if (item.quantity > item.product.stock) {
          throw new BadRequestException(
            `El producto "${item.product.name}" ya no tiene stock suficiente. Unidades disponibles: ${item.product.stock}`,
          );
        }

        const unitPrice = Number(item.unitPrice);
        const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
        subtotal += lineTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          lineTotal,
          productName: item.product.name,
          productImage: item.product.mainImage,
        });
      }

      // 3. Decrement stock for each product
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            purchaseCount: { increment: item.quantity },
          },
        });
      }

      // 4. Generate order number: ORD-YYYYNNNNN
      const orderNumber = await this.generateOrderNumber(tx);

      // 5. Shipping cost = 0 (free shipping for MVP)
      const shippingCost = 0;
      const total = Math.round((subtotal + shippingCost) * 100) / 100;

      // 6. Create the order with items
      const order = await tx.order.create({
        data: {
          id: uuidv7(),
          userId,
          orderNumber,
          status: 'processing',
          subtotal,
          shippingCost,
          total,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingPhone,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, mainImage: true },
              },
            },
          },
        },
      });

      // 7. Mark cart as converted (idempotency: prevents double-click)
      await tx.cart.update({
        where: { id: cartId },
        data: { status: 'converted' },
      });

      // 8. Map and return
      return this.mapOrderWithItems(order);
    });
  }

  async findUserOrders(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedOrders> {
    const skip = (page - 1) * limit;

    const [orders, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders.map((o) => this.mapOrder(o)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(orderId: string): Promise<OrderWithItems | null> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, mainImage: true },
            },
          },
        },
      },
    });

    return order ? this.mapOrderWithItems(order) : null;
  }

  // --- Helpers ---

  private async generateOrderNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ORD-${year}`;

    // Count existing orders this year to generate sequential number
    const count = await tx.order.count({
      where: {
        orderNumber: { startsWith: prefix },
      },
    });

    const sequential = String(count + 1).padStart(5, '0');
    return `${prefix}${sequential}`;
  }

  private mapOrder(raw: any): Order {
    return {
      id: raw.id,
      userId: raw.userId,
      orderNumber: raw.orderNumber,
      status: raw.status,
      subtotal: Number(raw.subtotal),
      shippingCost: Number(raw.shippingCost),
      total: Number(raw.total),
      shippingName: raw.shippingName,
      shippingAddress: raw.shippingAddress,
      shippingCity: raw.shippingCity,
      shippingPhone: raw.shippingPhone,
      createdAt: raw.createdAt,
    };
  }

  private mapOrderWithItems(raw: any): OrderWithItems {
    return {
      ...this.mapOrder(raw),
      items: (raw.items ?? []).map((item: any) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        productName: item.product?.name,
        productImage: item.product?.mainImage ?? undefined,
      })),
    };
  }
}
