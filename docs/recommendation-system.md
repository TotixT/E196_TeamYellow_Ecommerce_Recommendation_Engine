# Recommendation System Design

## Overview
The recommendation system uses the **Strategy Pattern** to allow flexible switching and combination of different recommendation algorithms.

## Strategies

### 1. Popularity Strategy
- **Logic**: Recommends products based on global popularity metrics.
- **Metrics**: Most viewed, most purchased.
- **Use Case**: New users (cold start), homepage trending section.

### 2. User History Strategy
- **Logic**: Recommends products based on individual user behavior.
- **Metrics**: Purchase history, frequent categories, viewed items.
- **Use Case**: Logged-in users with history.

### 3. (Future) ML Strategy
- **Logic**: Collaborative filtering or content-based filtering using Machine Learning models.
- **Integration**: The Strategy interface allows seamless integration of an external ML service or Python microservice.

## Interface Contract
```typescript
interface RecommendationStrategy {
  recommend(userId: string): Promise<string[]>;
}
```

## Data Model
- **RecommendationLog**: Tracks which strategy served which products to analyze performance.
