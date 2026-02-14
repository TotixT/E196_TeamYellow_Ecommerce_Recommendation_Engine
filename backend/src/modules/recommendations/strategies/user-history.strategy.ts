import { Injectable } from '@nestjs/common';
import { RecommendationStrategy } from './recommendation-strategy.interface';

/**
 * User history-based recommendation strategy
 * Recommends products based on user's purchase history and category preferences
 */
@Injectable()
export class UserHistoryStrategy implements RecommendationStrategy {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recommend(userId: string): Promise<string[]> {
    return Promise.resolve<string[]>([]);
  }
}
