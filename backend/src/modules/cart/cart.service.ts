import { Injectable } from '@nestjs/common';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  // TODO: Implement cart management logic
  // TODO: Implement add/remove/update items
}
