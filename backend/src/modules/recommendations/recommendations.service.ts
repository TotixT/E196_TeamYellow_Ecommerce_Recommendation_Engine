import { Injectable } from '@nestjs/common';
import { RecommendationsRepository } from './recommendations.repository';
import { RecommendationStrategy } from './strategies/recommendation-strategy.interface';

@Injectable()
export class RecommendationsService {
  private strategy: RecommendationStrategy;

  constructor(
    private readonly recommendationsRepository: RecommendationsRepository,
  ) {}

  setStrategy(strategy: RecommendationStrategy): void {
    this.strategy = strategy;
  }

  // TODO: Implement recommendation logic using Strategy pattern
  // TODO: Analyze purchase history
  // TODO: Track most viewed products
  // TODO: Track most purchased products
  // TODO: Analyze frequent categories per user
}
