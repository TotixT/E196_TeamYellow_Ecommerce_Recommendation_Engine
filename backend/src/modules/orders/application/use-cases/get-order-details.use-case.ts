import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IOrdersRepository } from '../../domain/interfaces/i-orders-repository.interface';

@Injectable()
export class GetOrderDetailsUseCase {
  constructor(
    @Inject('IOrdersRepository')
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async execute(orderId: string, userId: number) {
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Pedido no encontrado`);
    }

    // Ensure the order belongs to the requesting user
    if (order.userId !== userId) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }
}
