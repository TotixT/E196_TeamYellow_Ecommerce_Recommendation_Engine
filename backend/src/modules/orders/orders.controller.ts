import { Controller } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // TODO: GET /orders
  // TODO: GET /orders/:id
  // TODO: POST /orders
  // TODO: PATCH /orders/:id/status
}
