import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CartsModule } from '../carts/carts.module';
import { MailModule } from '../../common/shared/mail/mail.module';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { OrdersRepository } from './infrastructure/repositories/orders.repository';
import { CheckoutUseCase } from './application/use-cases/checkout.use-case';
import { ListUserOrdersUseCase } from './application/use-cases/list-user-orders.use-case';
import { GetOrderDetailsUseCase } from './application/use-cases/get-order-details.use-case';

@Module({
  imports: [CartsModule, MailModule], // Needed for ICartsRepository and MailService
  controllers: [OrdersController],
  providers: [
    // Use cases
    CheckoutUseCase,
    ListUserOrdersUseCase,
    GetOrderDetailsUseCase,
    // Repository — bound to interface token for DI
    { provide: 'IOrdersRepository', useClass: OrdersRepository },
    OrdersRepository,
    PrismaService,
  ],
})
export class OrdersModule {}
