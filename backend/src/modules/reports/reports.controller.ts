import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetMonthlySalesUseCase } from './application/use-cases/get-monthly-sales.use-case';
import { GetTopProductsUseCase } from './application/use-cases/get-top-products.use-case';
import { GetTopUsersUseCase } from './application/use-cases/get-top-users.use-case';
import { GetConversionRateUseCase } from './application/use-cases/get-conversion-rate.use-case';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
  constructor(
    private readonly getMonthlySalesUseCase: GetMonthlySalesUseCase,
    private readonly getTopProductsUseCase: GetTopProductsUseCase,
    private readonly getTopUsersUseCase: GetTopUsersUseCase,
    private readonly getConversionRateUseCase: GetConversionRateUseCase,
  ) {}

  @Get('sales')
  async getMonthlySales(@Query('year') year?: string) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    return this.getMonthlySalesUseCase.execute(parsedYear);
  }

  @Get('top-products')
  async getTopProducts(@Query('period') period?: 'month' | '3months' | 'year') {
    return this.getTopProductsUseCase.execute(period);
  }

  @Get('top-users')
  async getTopUsers(
    @Query('period') period?: 'month' | '3months' | 'year',
    @Query('format') format?: 'json' | 'csv',
    @Res({ passthrough: true }) res?: Response,
  ) {
    const result = await this.getTopUsersUseCase.execute(period, format);

    if (format === 'csv' && typeof result === 'string') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=top-users.csv',
      );
      res.send(result);
      return;
    }

    return result;
  }

  @Get('conversion')
  async getConversionRate(
    @Query('period') period?: 'month' | '3months' | 'year',
  ) {
    return this.getConversionRateUseCase.execute(period);
  }
}
