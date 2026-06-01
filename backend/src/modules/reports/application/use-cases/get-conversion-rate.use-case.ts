import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

type Period = 'month' | '3months' | 'year';

const MONTH_NAMES_ES: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};

interface CountResult {
  count: number;
}

interface MonthlySessionRow {
  month: number;
  sessions: number;
}

interface MonthlyPurchaseRow {
  month: number;
  purchases: number;
}

@Injectable()
export class GetConversionRateUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(period: Period = 'month') {
    const fromDate = this.getFromDate(period);
    const toDate = new Date();

    // Total unique sessions with VIEW events
    const [sessionsResult] = await this.prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(DISTINCT session_id)::int AS count
      FROM behavior_events
      WHERE event_type = 'VIEW'
        AND session_id IS NOT NULL
        AND created_at >= ${fromDate}
    `;
    const totalSessions = sessionsResult?.count ?? 0;

    // Total unique sessions/users with PURCHASE events
    const [purchasesResult] = await this.prisma.$queryRaw<CountResult[]>`
      SELECT COUNT(DISTINCT COALESCE(user_id::text, session_id))::int AS count
      FROM behavior_events
      WHERE event_type = 'PURCHASE'
        AND created_at >= ${fromDate}
    `;
    const totalPurchaseSessions = purchasesResult?.count ?? 0;

    // Conversion rate
    const conversionRate =
      totalSessions > 0
        ? Number(((totalPurchaseSessions / totalSessions) * 100).toFixed(2))
        : 0;

    // Monthly breakdown - sessions
    const monthlySessions = await this.prisma.$queryRaw<MonthlySessionRow[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(DISTINCT session_id)::int AS sessions
      FROM behavior_events
      WHERE event_type = 'VIEW'
        AND session_id IS NOT NULL
        AND created_at >= ${fromDate}
      GROUP BY month
      ORDER BY month
    `;

    // Monthly breakdown - purchases
    const monthlyPurchases = await this.prisma.$queryRaw<MonthlyPurchaseRow[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(DISTINCT COALESCE(user_id::text, session_id))::int AS purchases
      FROM behavior_events
      WHERE event_type = 'PURCHASE'
        AND created_at >= ${fromDate}
      GROUP BY month
      ORDER BY month
    `;

    // Build purchase map for quick lookup
    const purchaseMap = new Map<number, number>();
    for (const row of monthlyPurchases) {
      purchaseMap.set(row.month, row.purchases);
    }

    // Combine into monthly trend
    const monthlyTrend = monthlySessions.map((row) => {
      const purchases = purchaseMap.get(row.month) ?? 0;
      const rate =
        row.sessions > 0
          ? Number(((purchases / row.sessions) * 100).toFixed(2))
          : 0;

      return {
        month: row.month,
        monthName: MONTH_NAMES_ES[row.month] || `Mes ${row.month}`,
        sessions: row.sessions,
        purchases,
        rate,
      };
    });

    return {
      period,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      totalSessions,
      totalPurchaseSessions,
      conversionRate,
      monthlyTrend,
    };
  }

  private getFromDate(period: Period): Date {
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }
}
