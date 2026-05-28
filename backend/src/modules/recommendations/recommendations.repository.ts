import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Get categories from user's past purchases
  async getUserPurchasedCategoryIds(userId: number): Promise<number[]> {
    const events = await this.prisma.behaviorEvent.findMany({
      where: { userId, eventType: 'PURCHASE' },
      select: { productId: true },
      distinct: ['productId'],
    });

    if (events.length === 0) return [];

    const productIds = events.map(e => e.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { categoryId: true },
      distinct: ['categoryId'],
    });

    return products.map(p => p.categoryId);
  }

  // Get categories from user's/session's recent views
  async getRecentViewedCategoryIds(sessionId: string, userId?: number, limit = 10): Promise<number[]> {
    const whereClause = userId ? { userId } : { sessionId };
    
    const events = await this.prisma.behaviorEvent.findMany({
      where: { ...whereClause, eventType: 'VIEW' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { productId: true },
    });

    if (events.length === 0) return [];

    const productIds = [...new Set(events.map(e => e.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { categoryId: true },
      distinct: ['categoryId'],
    });

    return products.map(p => p.categoryId);
  }

  // Get products from categories that user hasn't purchased yet
  async getUnpurchasedProductsByCategories(
    userId: number,
    categoryIds: number[],
    limit = 8
  ) {
    const purchased = await this.prisma.behaviorEvent.findMany({
      where: { userId, eventType: 'PURCHASE' },
      select: { productId: true },
    });
    const purchasedIds = purchased.map(p => p.productId);

    return this.prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        id: { notIn: purchasedIds },
        status: 'active',
      },
      orderBy: { purchaseCount: 'desc' },
      take: limit,
    });
  }

  // Get similar products in same category excluding the current one
  async getSimilarProducts(categoryId: number, excludeProductId: number, limit = 6) {
    return this.prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeProductId },
        status: 'active',
      },
      orderBy: { purchaseCount: 'desc' },
      take: limit,
    });
  }

  // Get most popular products overall
  async getPopularProducts(limit = 8) {
    return this.prisma.product.findMany({
      where: { status: 'active' },
      orderBy: { purchaseCount: 'desc' },
      take: limit,
    });
  }
}
