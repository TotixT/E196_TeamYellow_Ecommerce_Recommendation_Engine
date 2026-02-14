import { Controller } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // TODO: GET /recommendations - Get personalized recommendations
  // TODO: GET /recommendations/popular - Get popular products
  // TODO: GET /recommendations/history - Get history-based recommendations
}
