import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';
import { AddToCartDto } from '../dtos/add-to-cart.dto';

@Injectable()
export class AddToCartUseCase {
  constructor(
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
  ) {}

  async execute(
    dto: AddToCartDto,
    userId: number | null,
    sessionId: string | null,
  ) {
    const { productId, quantity = 1 } = dto;

    // Validate product exists, is active, and not deleted
    const product = await this.cartsRepository.findProductById(productId);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }
    if (product.status !== 'active') {
      throw new BadRequestException('Este producto no está disponible');
    }

    // Find or create active cart
    let cart = await this.cartsRepository.findActiveCart(userId, sessionId);
    if (!cart) {
      cart = await this.cartsRepository.createCart(userId, sessionId);
    }

    // Check if the product is already in the cart
    const existingItem = await this.cartsRepository.findItemByProduct(
      cart.id,
      productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Validate stock
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Solo hay ${product.stock} unidades disponibles de este producto`,
        );
      }

      const updatedItem = await this.cartsRepository.updateItemQuantity(
        existingItem.id,
        newQuantity,
      );

      return {
        message: 'Cantidad actualizada en el carrito',
        item: updatedItem,
      };
    }

    // Validate stock for new item
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Solo hay ${product.stock} unidades disponibles de este producto`,
      );
    }

    // Price snapshot: store the current price at the moment of adding
    const item = await this.cartsRepository.addItem({
      cartId: cart.id,
      productId,
      quantity,
      unitPrice: product.price,
    });

    return {
      message: 'Producto agregado al carrito',
      item,
    };
  }
}
