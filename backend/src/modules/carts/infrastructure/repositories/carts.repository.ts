import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';
import { Cart, CartItem, CartWithItems } from '../../domain/entities/cart.entity';

@Injectable()
export class CartsRepository implements ICartsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveCart(
    userId: number | null,
    sessionId: string | null,
  ): Promise<Cart | null> {
    const where: any = { status: 'active' };
    if (userId) {
      where.userId = userId;
    } else if (sessionId) {
      where.sessionId = sessionId;
    } else {
      return null;
    }

    const cart = await this.prisma.cart.findFirst({ where });
    return cart ? this.mapCart(cart) : null;
  }

  async createCart(
    userId: number | null,
    sessionId: string | null,
  ): Promise<Cart> {
    const cart = await this.prisma.cart.create({
      data: {
        userId,
        sessionId,
        status: 'active',
      },
    });
    return this.mapCart(cart);
  }

  async getCartWithItems(cartId: number): Promise<CartWithItems | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                mainImage: true,
                stock: true,
              },
            },
          },
          orderBy: { addedAt: 'asc' },
        },
      },
    });

    if (!cart) return null;

    const items: CartItem[] = cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      addedAt: item.addedAt,
      productName: item.product.name,
      productImage: item.product.mainImage ?? undefined,
      productStock: item.product.stock,
    }));

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );

    return {
      ...this.mapCart(cart),
      items,
      totalItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
    };
  }

  // --- Item Operations ---

  async findItemByProduct(
    cartId: number,
    productId: number,
  ): Promise<CartItem | null> {
    const item = await this.prisma.cartItem.findFirst({
      where: { cartId, productId },
    });
    return item ? this.mapItem(item) : null;
  }

  async findItemById(itemId: number): Promise<CartItem | null> {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });
    return item ? this.mapItem(item) : null;
  }

  async addItem(data: {
    cartId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
  }): Promise<CartItem> {
    const item = await this.prisma.cartItem.create({ data });
    return this.mapItem(item);
  }

  async updateItemQuantity(
    itemId: number,
    quantity: number,
  ): Promise<CartItem> {
    const item = await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.mapItem(item);
  }

  async removeItem(itemId: number): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  // --- Cart Lifecycle ---

  async mergeAnonymousCart(sessionId: string, userId: number): Promise<void> {
    // Find the anonymous cart
    const anonCart = await this.prisma.cart.findFirst({
      where: { sessionId, status: 'active', userId: null },
    });
    if (!anonCart) return;

    // Find or create the user's active cart
    let userCart = await this.prisma.cart.findFirst({
      where: { userId, status: 'active' },
    });

    if (!userCart) {
      // Simply assign the anonymous cart to the user
      await this.prisma.cart.update({
        where: { id: anonCart.id },
        data: { userId, sessionId: null },
      });
      return;
    }

    // Merge: move items from anonymous cart to user cart
    const anonItems = await this.prisma.cartItem.findMany({
      where: { cartId: anonCart.id },
    });

    for (const item of anonItems) {
      const existingItem = await this.prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: item.productId },
      });

      if (existingItem) {
        // If user already has this product, sum the quantities
        const newQty = existingItem.quantity + item.quantity;
        await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });
        
        // Delete the duplicate item from the anonymous cart so it doesn't stay lingering
        await this.prisma.cartItem.delete({
          where: { id: item.id }
        });
      } else {
        // Move item to user cart
        await this.prisma.cartItem.update({
          where: { id: item.id },
          data: { cartId: userCart.id },
        });
      }
    }

    // Since we merged all items, we can safely delete the anonymous cart
    // to avoid confusion with empty "abandoned" carts in the DB.
    await this.prisma.cart.delete({
      where: { id: anonCart.id },
    });
  }

  async markAsConverted(cartId: number): Promise<void> {
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { status: 'converted' },
    });
  }

  // --- Product Lookup ---

  async findProductById(productId: number): Promise<{
    id: number;
    name: string;
    price: number;
    stock: number;
    status: string;
    mainImage: string | null;
  } | null> {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        status: true,
        mainImage: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      status: product.status,
      mainImage: product.mainImage,
    };
  }

  // --- Mappers ---

  private mapCart(raw: any): Cart {
    return {
      id: raw.id,
      userId: raw.userId,
      sessionId: raw.sessionId,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  private mapItem(raw: any): CartItem {
    return {
      id: raw.id,
      cartId: raw.cartId,
      productId: raw.productId,
      quantity: raw.quantity,
      unitPrice: Number(raw.unitPrice),
      addedAt: raw.addedAt,
    };
  }
}
