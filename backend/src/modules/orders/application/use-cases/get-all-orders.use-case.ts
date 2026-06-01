import { Injectable, Inject } from '@nestjs/common';
import { IOrdersRepository } from '../../domain/interfaces/i-orders-repository.interface';

@Injectable()
export class GetAllOrdersUseCase {
  constructor(
    @Inject('IOrdersRepository')
    private readonly ordersRepository: IOrdersRepository,
  ) {}

  async execute(page: number = 1, limit: number = 10) {
    return this.ordersRepository.findAllOrders(page, limit);
  }
}
