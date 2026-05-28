import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsRepository } from './recommendations.repository';
import { PopularityStrategy } from './strategies/popularity.strategy';
import { UserHistoryStrategy } from './strategies/user-history.strategy';
import { BehaviorEventsListener } from './application/listeners/behavior-events.listener';
import { PrismaModule } from '../../database/prisma.module';
import { MetricsController } from './metrics.controller';
import { GetRecommendationMetricsUseCase } from './application/use-cases/get-recommendation-metrics.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [RecommendationsController, MetricsController],
  providers: [
    RecommendationsService,
    RecommendationsRepository,
    PopularityStrategy,
    UserHistoryStrategy,
    BehaviorEventsListener,
    GetRecommendationMetricsUseCase,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
