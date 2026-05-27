import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';

@Injectable()
export class RemoveCartItemUseCase {
  constructor(
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
  ) {}

  async execute(
    itemId: number,
    userId: number | null,
    sessionId: string | null,
  ) {
    // Find the item
    const item = await this.cartsRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Ítem con ID ${itemId} no encontrado`);
    }

    // Verify this item belongs to the user's active cart
    const cart = await this.cartsRepository.findActiveCart(userId, sessionId);
    if (!cart || item.cartId !== cart.id) {
      throw new NotFoundException('Este ítem no pertenece a tu carrito');
    }

    await this.cartsRepository.removeItem(itemId);

    return { message: 'Producto eliminado del carrito' };
  }
}
