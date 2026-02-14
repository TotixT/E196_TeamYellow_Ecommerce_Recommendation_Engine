/**
 * Strategy Pattern Interface for Recommendation Engine
 *
 * Allows interchangeable recommendation algorithms.
 * Designed for future Machine Learning integration.
 *
 * Available strategies:
 * - PopularityStrategy: Based on most viewed/purchased products
 * - UserHistoryStrategy: Based on user purchase history
 * - (Future) MLStrategy: Machine Learning based recommendations
 */
export interface RecommendationStrategy {
  /**
   * Generate product recommendations for a given user
   * @param userId - The ID of the user to generate recommendations for
   * @returns Array of recommended product IDs
   */
  recommend(userId: string): Promise<string[]>;
}
