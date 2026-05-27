import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CheckoutUseCase } from '../../application/use-cases/checkout.use-case';
import { ListUserOrdersUseCase } from '../../application/use-cases/list-user-orders.use-case';
import { GetOrderDetailsUseCase } from '../../application/use-cases/get-order-details.use-case';
import { CheckoutDto } from '../../application/dtos/checkout.dto';

@Controller()
export class OrdersController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly listUserOrdersUseCase: ListUserOrdersUseCase,
    private readonly getOrderDetailsUseCase: GetOrderDetailsUseCase,
  ) {}

  // POST /api/v1/orders/checkout — Process checkout (requires auth)
  @Post('orders/checkout')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    const userId = req.user.id;
    const userEmail = req.user.email;
    return this.checkoutUseCase.execute(userId, userEmail, dto);
  }

  // GET /api/v1/orders — List user's orders (requires auth)
  @Get('orders')
  @UseGuards(JwtAuthGuard)
  listOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.id;
    return this.listUserOrdersUseCase.execute(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // GET /api/v1/orders/:id — View order detail (requires auth)
  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrderDetail(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.getOrderDetailsUseCase.execute(id, userId);
  }
}
