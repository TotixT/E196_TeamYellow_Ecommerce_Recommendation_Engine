import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';
import { UpdateCartItemDto } from '../dtos/update-cart-item.dto';

@Injectable()
export class UpdateCartItemUseCase {
  constructor(
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
  ) {}

  async execute(
    itemId: number,
    dto: UpdateCartItemDto,
    userId: number | null,
    sessionId: string | null,
  ) {
    // Find the cart item
    const item = await this.cartsRepository.findItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Ítem con ID ${itemId} no encontrado`);
    }

    // Verify this item belongs to the user's active cart
    const cart = await this.cartsRepository.findActiveCart(userId, sessionId);
    if (!cart || item.cartId !== cart.id) {
      throw new NotFoundException('Este ítem no pertenece a tu carrito');
    }

    // Validate stock
    const product = await this.cartsRepository.findProductById(item.productId);
    if (!product) {
      throw new NotFoundException('El producto ya no existe');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException(
        `Solo hay ${product.stock} unidades disponibles de este producto`,
      );
    }

    const updatedItem = await this.cartsRepository.updateItemQuantity(
      itemId,
      dto.quantity,
    );

    return {
      message: 'Cantidad actualizada exitosamente',
      item: updatedItem,
    };
  }
}
