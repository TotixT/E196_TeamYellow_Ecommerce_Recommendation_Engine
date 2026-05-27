import { Injectable, Inject } from '@nestjs/common';
import { ICartsRepository } from '../../domain/interfaces/i-carts-repository.interface';

@Injectable()
export class MergeCartUseCase {
  constructor(
    @Inject('ICartsRepository')
    private readonly cartsRepository: ICartsRepository,
  ) {}

  async execute(sessionId: string, userId: number) {
    await this.cartsRepository.mergeAnonymousCart(sessionId, userId);
    return { message: 'Carrito fusionado exitosamente' };
  }
}
