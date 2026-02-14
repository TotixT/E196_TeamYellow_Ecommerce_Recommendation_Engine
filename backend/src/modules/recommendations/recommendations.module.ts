import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsRepository } from './recommendations.repository';
import { PopularityStrategy } from './strategies/popularity.strategy';
import { UserHistoryStrategy } from './strategies/user-history.strategy';

@Module({
  controllers: [RecommendationsController],
  providers: [
    RecommendationsService,
    RecommendationsRepository,
    PopularityStrategy,
    UserHistoryStrategy,
  ],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
