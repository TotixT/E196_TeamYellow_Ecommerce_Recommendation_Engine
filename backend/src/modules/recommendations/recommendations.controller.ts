import { Controller, Post, Get, Param, Body, Req, ParseIntPipe, HttpCode, HttpStatus, UseInterceptors, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RecommendationClickedEvent } from './application/listeners/behavior-events.listener';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JwtOptionalGuard } from '../../common/guards/jwt-optional.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserCacheInterceptor } from '../../common/interceptors/user-cache.interceptor';

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // PUBLIC: POST /api/v1/recommendations/track-click
  @Post('track-click')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOptionalGuard)
  trackClick(
    @Body('recommendedProductId', ParseIntPipe) recommendedProductId: number,
    @Body('originProductId', ParseIntPipe) originProductId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    this.eventEmitter.emit(
      'recommendation.clicked',
      new RecommendationClickedEvent(recommendedProductId, originProductId, userId, sessionId),
    );

    return { success: true };
  }

  // PUBLIC: POST /api/v1/recommendations/track-view
  @Post('track-view')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOptionalGuard)
  trackView(
    @Body('productId', ParseIntPipe) productId: number,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];

    // Emite el evento de vista, que el listener guardará en la base de datos
    this.eventEmitter.emit(
      'product.viewed',
      { productId, userId, sessionId }
    );

    return { success: true };
  }

  // PUBLIC: GET /api/v1/recommendations/home
  @Get('home')
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(JwtOptionalGuard)
  getHomeRecommendations(@Req() req: any) {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    return this.recommendationsService.getHomeRecommendations(userId, sessionId);
  }

  // AUTH REQUIRED: GET /api/v1/recommendations/history
  @Get('history')
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(JwtAuthGuard)
  getHistoryRecommendations(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      return [];
    }
    return this.recommendationsService.getHistoryBasedRecommendations(userId);
  }

  // PUBLIC: GET /api/v1/recommendations/session
  @Get('session')
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(JwtOptionalGuard)
  getSessionRecommendations(@Req() req: any) {
    const userId = req.user?.id;
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId && !userId) {
      return [];
    }
    
    return this.recommendationsService.getSessionBasedRecommendations(sessionId, userId);
  }

  // PUBLIC: GET /api/v1/recommendations/similar/:productId
  @Get('similar/:productId')
  @UseInterceptors(UserCacheInterceptor)
  @UseGuards(JwtOptionalGuard)
  getSimilarRecommendations(@Param('productId', ParseIntPipe) productId: number) {
    return this.recommendationsService.getSimilarProducts(productId);
  }
}
