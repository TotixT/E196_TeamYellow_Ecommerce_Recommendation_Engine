import {
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IOrdersRepository } from '../../domain/interfaces/i-orders-repository.interface';
import { ICartsRepository } from '../../../carts/domain/interfaces/i-carts-repository.interface';
import { CheckoutDto } from '../dtos/checkout.dto';
import { MailService } from '../../../../common/shared/mail/mail.service';

@Injectable()
export class CheckoutUseCase {
  constructor(
    @Inject('IOrdersRepository')
    private readonly ordersRepository: IOrdersRepository,
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(userId: number, userEmail: string, dto: CheckoutDto) {
    // Find the user's active cart
    const cart = await this.cartsRepository.findActiveCart(userId, null);
    if (!cart) {
      throw new BadRequestException('No tienes un carrito activo');
    }

    // Get cart details to verify it has items
    const cartDetails = await this.cartsRepository.getCartWithItems(cart.id);
    if (!cartDetails || cartDetails.items.length === 0) {
      throw new BadRequestException('Tu carrito está vacío');
    }

    // Execute atomic checkout
    const order = await this.ordersRepository.checkout({
      userId,
      cartId: cart.id,
      shippingName: dto.shippingName,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      shippingPhone: dto.shippingPhone,
    });

    // Calculate estimated delivery (e.g. 3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const estimatedDelivery = deliveryDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Fire and forget email notification
    this.mailService.sendOrderConfirmation(userEmail, {
      orderNumber: order.orderNumber,
      customerName: dto.shippingName,
      items: order.items.map(i => ({
        productName: i.productName || 'Producto',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      shippingAddress: dto.shippingAddress,
      shippingCity: dto.shippingCity,
      estimatedDelivery: estimatedDelivery
    });

    return {
      message: 'Pedido confirmado exitosamente',
      order,
    };
  }
}
