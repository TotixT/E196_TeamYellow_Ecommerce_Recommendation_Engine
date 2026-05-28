import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ReportsController } from './reports.controller';
import { GetMonthlySalesUseCase } from './application/use-cases/get-monthly-sales.use-case';
import { GetTopProductsUseCase } from './application/use-cases/get-top-products.use-case';
import { GetTopUsersUseCase } from './application/use-cases/get-top-users.use-case';
import { GetConversionRateUseCase } from './application/use-cases/get-conversion-rate.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [
    GetMonthlySalesUseCase,
    GetTopProductsUseCase,
    GetTopUsersUseCase,
    GetConversionRateUseCase,
  ],
})
export class ReportsModule {}
