import { Controller } from '@nestjs/common';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // TODO: GET /cart
  // TODO: POST /cart/items
  // TODO: PATCH /cart/items/:id
  // TODO: DELETE /cart/items/:id
  // TODO: DELETE /cart (clear cart)
}
