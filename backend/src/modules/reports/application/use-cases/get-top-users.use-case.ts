import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

type Period = 'month' | '3months' | 'year';
type Format = 'json' | 'csv';

interface TopUserRow {
  id: number;
  fullName: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
}

@Injectable()
export class GetTopUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(period: Period = 'month', format: Format = 'json') {
    const fromDate = this.getFromDate(period);
    const toDate = new Date();

    const users = await this.prisma.$queryRaw<TopUserRow[]>`
      SELECT
        u.id,
        u.full_name AS "fullName",
        u.email,
        COUNT(o.id)::int AS "totalOrders",
        COALESCE(SUM(o.total), 0) AS "totalSpent"
      FROM users u
      JOIN orders o ON u.id = o.user_id
      WHERE o.created_at >= ${fromDate}
        AND o.status != 'cancelled'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY "totalSpent" DESC
      LIMIT 10
    `;

    const mappedUsers = users.map((u) => ({
      ...u,
      totalSpent: Number(u.totalSpent),
    }));

    if (format === 'csv') {
      return this.convertToCsv(mappedUsers);
    }

    return {
      period,
      dateRange: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      users: mappedUsers,
    };
  }

  private convertToCsv(
    users: {
      id: number;
      fullName: string;
      email: string;
      totalOrders: number;
      totalSpent: number;
    }[],
  ): string {
    const header = 'Posición,Nombre,Email,Total Pedidos,Total Gastado';
    const rows = users.map(
      (u, index) =>
        `${index + 1},"${u.fullName}","${u.email}",${u.totalOrders},${u.totalSpent.toFixed(2)}`,
    );
    return [header, ...rows].join('\n');
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
