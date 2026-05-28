import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

interface MonthlySalesRow {
  month: number;
  totalorders: number;
  totalrevenue: number;
}

export interface MonthData {
  month: number;
  monthName: string;
  totalOrders: number;
  totalRevenue: number;
}

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

@Injectable()
export class GetMonthlySalesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    const rows = await this.prisma.$queryRaw<MonthlySalesRow[]>`
      SELECT
        EXTRACT(MONTH FROM created_at)::int AS month,
        COUNT(*)::int AS totalorders,
        COALESCE(SUM(total), 0) AS totalrevenue
      FROM orders
      WHERE EXTRACT(YEAR FROM created_at) = ${targetYear}
        AND status != 'cancelled'
      GROUP BY month
      ORDER BY month
    `;

    const months: MonthData[] = rows.map((row) => ({
      month: row.month,
      monthName: MONTH_NAMES_ES[row.month] || `Mes ${row.month}`,
      totalOrders: row.totalorders,
      totalRevenue: Number(row.totalrevenue),
    }));

    const totalAccumulated = months.reduce(
      (sum, m) => sum + m.totalRevenue,
      0,
    );

    return {
      year: targetYear,
      months,
      totalAccumulated,
    };
  }
}
