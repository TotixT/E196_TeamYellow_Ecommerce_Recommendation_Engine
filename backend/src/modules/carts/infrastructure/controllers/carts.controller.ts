import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Headers,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtOptionalGuard } from '../../../../common/guards/jwt-optional.guard';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AddToCartUseCase } from '../../application/use-cases/add-to-cart.use-case';
import { UpdateCartItemUseCase } from '../../application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from '../../application/use-cases/remove-cart-item.use-case';
import { GetCartUseCase } from '../../application/use-cases/get-cart.use-case';
import { MergeCartUseCase } from '../../application/use-cases/merge-cart.use-case';
import { AddToCartDto } from '../../application/dtos/add-to-cart.dto';
import { UpdateCartItemDto } from '../../application/dtos/update-cart-item.dto';

@Controller()
export class CartsController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly updateCartItemUseCase: UpdateCartItemUseCase,
    private readonly removeCartItemUseCase: RemoveCartItemUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly mergeCartUseCase: MergeCartUseCase,
  ) {}

  /**
   * Extract userId from JWT (if logged in) or sessionId from header (if anonymous).
   */
  private extractIdentity(
    req: any,
    sessionIdHeader?: string,
    requireIdentity: boolean = true,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId: number | null = req.user?.id ?? null;
    const sessionId: string | null = !userId ? (sessionIdHeader ?? null) : null;

    if (requireIdentity && !userId && !sessionId) {
      throw new BadRequestException(
        'Debes enviar un token de autorización o un header X-Session-ID',
      );
    }

    return { userId, sessionId };
  }

  // GET /api/v1/cart — View active cart (anonymous or authenticated)
  @Get('cart')
  @UseGuards(JwtOptionalGuard)
  getCart(@Req() req: any, @Headers('x-session-id') sessionId?: string) {
    // Para ver el carrito no obligamos identidad (si no tiene, devolvemos carrito vacío)
    const { userId, sessionId: sid } = this.extractIdentity(
      req,
      sessionId,
      false,
    );
    return this.getCartUseCase.execute(userId, sid);
  }

  // POST /api/v1/cart/items — Add product to cart
  @Post('cart/items')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtOptionalGuard)
  addItem(
    @Body() dto: AddToCartDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const { userId, sessionId: sid } = this.extractIdentity(req, sessionId);
    return this.addToCartUseCase.execute(dto, userId, sid);
  }

  // PUT /api/v1/cart/items/:itemId — Update quantity
  @Put('cart/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOptionalGuard)
  updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const { userId, sessionId: sid } = this.extractIdentity(req, sessionId);
    return this.updateCartItemUseCase.execute(itemId, dto, userId, sid);
  }

  // DELETE /api/v1/cart/items/:itemId — Remove item
  @Delete('cart/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtOptionalGuard)
  removeItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Req() req: any,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const { userId, sessionId: sid } = this.extractIdentity(req, sessionId);
    return this.removeCartItemUseCase.execute(itemId, userId, sid);
  }

  // POST /api/v1/cart/merge — Merge anonymous cart into user cart after login
  @Post('cart/merge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  mergeCart(@Req() req: any, @Headers('x-session-id') sessionId?: string) {
    if (!sessionId) {
      return { message: 'No hay carrito anónimo que fusionar' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.mergeCartUseCase.execute(sessionId, userId);
  }
}
