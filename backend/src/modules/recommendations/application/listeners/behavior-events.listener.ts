import { Injectable, Logger, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class ProductViewedEvent {
  constructor(
    public readonly productId: number,
    public readonly userId?: number,
    public readonly sessionId?: string,
  ) {}
}

export class OrderPurchasedEvent {
  constructor(
    public readonly userId: number,
    public readonly items: { productId: number; quantity: number; unitPrice: number }[],
  ) {}
}

export class RecommendationClickedEvent {
  constructor(
    public readonly recommendedProductId: number,
    public readonly originProductId?: number,
    public readonly userId?: number,
    public readonly sessionId?: string,
  ) {}
}

@Injectable()
export class BehaviorEventsListener {
  private readonly logger = new Logger(BehaviorEventsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @OnEvent('product.viewed', { async: true })
  async handleProductViewedEvent(payload: ProductViewedEvent) {
    try {
      await this.prisma.behaviorEvent.create({
        data: {
          eventType: 'VIEW',
          productId: payload.productId,
          userId: payload.userId,
          sessionId: payload.sessionId,
        },
      });

      // EIE-QA: Invalidate session cache immediately so the UI reflects the new view!
      const userIdStr = payload.userId || 'anonymous';
      const sessionIdStr = payload.sessionId || 'no-session';
      await this.cacheManager.del(`/api/v1/recommendations/session-${userIdStr}-${sessionIdStr}`);
      
    } catch (error) {
      this.logger.error(`Failed to track product.viewed: ${error.message}`);
    }
  }

  @OnEvent('order.purchased', { async: true })
  async handleOrderPurchasedEvent(payload: OrderPurchasedEvent) {
    try {
      const eventsData = payload.items.map(item => ({
        eventType: 'PURCHASE' as const,
        productId: item.productId,
        userId: payload.userId,
        quantity: item.quantity,
        pricePaid: item.unitPrice,
      }));

      await this.prisma.behaviorEvent.createMany({
        data: eventsData,
      });

      // EIE-QA: Invalidate home and history caches for this user
      const userIdStr = payload.userId;
      await this.cacheManager.del(`/api/v1/recommendations/home-${userIdStr}-no-session`);
      await this.cacheManager.del(`/api/v1/recommendations/history-${userIdStr}-no-session`);

      this.logger.log(`Tracked ${eventsData.length} PURCHASE events for user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`Failed to track order.purchased: ${error.message}`);
    }
  }

  @OnEvent('recommendation.clicked', { async: true })
  async handleRecommendationClickedEvent(payload: RecommendationClickedEvent) {
    try {
      await this.prisma.behaviorEvent.create({
        data: {
          eventType: 'CLICK_RECOMMENDATION',
          productId: payload.recommendedProductId,
          contextProductId: payload.originProductId,
          userId: payload.userId,
          sessionId: payload.sessionId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to track recommendation.clicked: ${error.message}`);
    }
  }
}
