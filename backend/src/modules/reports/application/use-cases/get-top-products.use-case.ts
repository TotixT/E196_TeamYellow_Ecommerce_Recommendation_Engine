import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

type Period = 'month' | '3months' | 'year';

interface TopProductRow {
  id: number;
  name: string;
  mainImage: string | null;
  price: number;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

@Injectable()
export class GetTopProductsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(period: Period = 'month') {
    const fromDate = this.getFromDate(period);
    const toDate = new Date();

    const products = await this.prisma.$queryRaw<TopProductRow[]>`
      SELECT
        p.id,
        p.name,
        p.main_image AS "mainImage",
        p.price,
        c.name AS "categoryName",
        COALESCE(SUM(oi.quantity), 0)::int AS "unitsSold",
        COALESCE(SUM(oi.line_total), 0) AS revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE o.created_at >= ${fromDate}
        AND o.status != 'cancelled'
      GROUP BY p.id, p.name, p.main_image, p.price, c.name
      ORDER BY "unitsSold" DESC
      LIMIT 10
    `;

    return {
      period,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
        revenue: Number(p.revenue),
      })),
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
