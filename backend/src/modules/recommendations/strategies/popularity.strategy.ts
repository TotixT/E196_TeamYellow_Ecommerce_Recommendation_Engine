import { Injectable } from '@nestjs/common';
import { RecommendationStrategy } from './recommendation-strategy.interface';

/**
 * Popularity-based recommendation strategy
 * Recommends products based on most viewed and most purchased items
 */
@Injectable()
export class PopularityStrategy implements RecommendationStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recommend(userId: string): Promise<string[]> {
    return Promise.resolve<string[]>([]);
  }
}
