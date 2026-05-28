import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetRecommendationMetricsUseCase } from './application/use-cases/get-recommendation-metrics.use-case';

@Controller('admin/recommendations/metrics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MetricsController {
  constructor(
    private readonly getRecommendationMetricsUseCase: GetRecommendationMetricsUseCase,
  ) {}

  // ADMIN: GET /api/v1/admin/recommendations/metrics?period=week
  @Get()
  getMetrics(@Query('period') period?: 'day' | 'week' | 'month') {
    return this.getRecommendationMetricsUseCase.execute(period || 'week');
  }
}
