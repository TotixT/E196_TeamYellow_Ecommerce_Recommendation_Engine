import { Injectable, NotFoundException } from '@nestjs/common';
import { RecommendationsRepository } from './recommendations.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly recommendationsRepository: RecommendationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getHistoryBasedRecommendations(userId: number) {
    const categoryIds =
      await this.recommendationsRepository.getUserPurchasedCategoryIds(userId);
    if (categoryIds.length === 0) return [];

    return this.recommendationsRepository.getUnpurchasedProductsByCategories(
      userId,
      categoryIds,
      8,
    );
  }

  async getSessionBasedRecommendations(sessionId: string, userId?: number) {
    const categoryIds =
      await this.recommendationsRepository.getRecentViewedCategoryIds(
        sessionId,
        userId,
        10,
      );
    if (categoryIds.length === 0) return [];

    // If userId exists, we can exclude purchased products.
    // For simplicity and matching requirements, we'll use the same repository method if userId is present.
    // If anonymous, we just fetch popular products from those categories.
    if (userId) {
      return this.recommendationsRepository.getUnpurchasedProductsByCategories(
        userId,
        categoryIds,
        8,
      );
    } else {
      return this.prisma.product.findMany({
        where: { categoryId: { in: categoryIds }, status: 'active' },
        orderBy: { purchaseCount: 'desc' },
        take: 8,
      });
    }
  }

  async getSimilarProducts(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return this.recommendationsRepository.getSimilarProducts(
      product.categoryId,
      productId,
      6,
    );
  }

  async getHomeRecommendations(userId?: number, sessionId?: string) {
    if (userId) {
      const historyRecs = await this.getHistoryBasedRecommendations(userId);
      if (historyRecs.length > 0) {
        return historyRecs; // Custom recommendations based on purchases
      }
    }

    if (userId || sessionId) {
      // Si no tiene historial de compras pero ha visto productos, usar la sesión o el ID del usuario
      const sessionRecs = await this.getSessionBasedRecommendations(
        sessionId || '',
        userId,
      );
      if (sessionRecs.length > 0) {
        return sessionRecs;
      }
    }

    // Fallback: Popular products for anonymous or users without history/views
    return this.recommendationsRepository.getPopularProducts(8);
  }
}
