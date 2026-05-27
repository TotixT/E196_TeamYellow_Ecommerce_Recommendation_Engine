import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CartsController } from './infrastructure/controllers/carts.controller';
import { CartsRepository } from './infrastructure/repositories/carts.repository';
import { AddToCartUseCase } from './application/use-cases/add-to-cart.use-case';
import { UpdateCartItemUseCase } from './application/use-cases/update-cart-item.use-case';
import { RemoveCartItemUseCase } from './application/use-cases/remove-cart-item.use-case';
import { GetCartUseCase } from './application/use-cases/get-cart.use-case';
import { MergeCartUseCase } from './application/use-cases/merge-cart.use-case';

@Module({
  controllers: [CartsController],
  providers: [
    // Use cases
    AddToCartUseCase,
    UpdateCartItemUseCase,
    RemoveCartItemUseCase,
    GetCartUseCase,
    MergeCartUseCase,
    // Repository — bound to interface token for DI
    { provide: 'ICartsRepository', useClass: CartsRepository },
    CartsRepository,
    PrismaService,
  ],
  exports: [CartsRepository, 'ICartsRepository'],
})
export class CartsModule {}
