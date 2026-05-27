import { Injectable, Inject } from '@nestjs/common';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';

@Injectable()
export class GetCartUseCase {
  constructor(
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
  ) {}

  async execute(userId: number | null, sessionId: string | null) {
    const cart = await this.cartsRepository.findActiveCart(userId, sessionId);

    if (!cart) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        message: 'Tu carrito está vacío',
      };
    }

    const cartWithItems = await this.cartsRepository.getCartWithItems(cart.id);

    if (!cartWithItems || cartWithItems.items.length === 0) {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0,
        message: 'Tu carrito está vacío',
      };
    }

    return cartWithItems;
  }
}
