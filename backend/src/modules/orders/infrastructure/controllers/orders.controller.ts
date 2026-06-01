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
import { GetAllOrdersUseCase } from '../../application/use-cases/get-all-orders.use-case';
import { CheckoutDto } from '../../application/dtos/checkout.dto';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@Controller()
export class OrdersController {
  constructor(
    private readonly checkoutUseCase: CheckoutUseCase,
    private readonly listUserOrdersUseCase: ListUserOrdersUseCase,
    private readonly getOrderDetailsUseCase: GetOrderDetailsUseCase,
    private readonly getAllOrdersUseCase: GetAllOrdersUseCase,
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

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrderDetail(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.getOrderDetailsUseCase.execute(id, userId);
  }

  // GET /api/v1/admin/orders — List all orders in the platform (Admin only)
  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.getAllOrdersUseCase.execute(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
