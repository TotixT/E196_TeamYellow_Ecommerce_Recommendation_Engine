import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetRecommendationMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(period: 'day' | 'week' | 'month' = 'week') {
    const now = new Date();
    const startDate = new Date();
    if (period === 'day') startDate.setDate(now.getDate() - 1);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);

    // 1. Calculate CTR (Click-Through Rate)
    // Impressions are roughly modeled as VIEW events in this basic MVP
    // Clicks are CLICK_RECOMMENDATION events
    const impressionsCount = await this.prisma.behaviorEvent.count({
      where: {
        eventType: 'VIEW',
        createdAt: { gte: startDate },
      },
    });

    const clicksCount = await this.prisma.behaviorEvent.count({
      where: {
        eventType: 'CLICK_RECOMMENDATION',
        createdAt: { gte: startDate },
      },
    });

    const ctr =
      impressionsCount > 0 ? (clicksCount / impressionsCount) * 100 : 0;

    // 2. Calculate Conversion Rate from Recommendations
    // Purchases that happened where the user also clicked a recommendation recently
    const totalPurchases = await this.prisma.behaviorEvent.count({
      where: {
        eventType: 'PURCHASE',
        createdAt: { gte: startDate },
      },
    });

    // In a real advanced system, we'd link the specific click to the purchase via an attribution window.
    // For this MVP, we consider a purchase "converted from recommendation" if the user had a CLICK_RECOMMENDATION event
    // in the same session or recently before the purchase.
    // Let's approximate: count distinct users who purchased AND clicked a recommendation in the period.
    const clickingUsers = await this.prisma.behaviorEvent.findMany({
      where: {
        eventType: 'CLICK_RECOMMENDATION',
        createdAt: { gte: startDate },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const clickingUserIds = clickingUsers
      .map((u) => u.userId)
      .filter((id) => id !== null);

    const convertedPurchases = await this.prisma.behaviorEvent.count({
      where: {
        eventType: 'PURCHASE',
        createdAt: { gte: startDate },
        userId: { in: clickingUserIds },
      },
    });

    const conversionRate =
      totalPurchases > 0 ? (convertedPurchases / totalPurchases) * 100 : 0;

    return {
      period,
      impressions: impressionsCount,
      clicks: clicksCount,
      ctr: parseFloat(ctr.toFixed(2)),
      totalPurchases,
      convertedPurchases,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }
}
