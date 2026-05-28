import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './database/prisma.module';
import { LoggerModule } from './common/logger/logger.module';
import { CloudinaryModule } from './common/shared/cloudinary/cloudinary.module';
import { MailModule } from './common/shared/mail/mail.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    EventEmitterModule.forRoot({
      global: true, // Make events available globally
      wildcard: false,
      delimiter: '.',
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutes by default
    }),
    PrismaModule,
    LoggerModule,
    CloudinaryModule,
    MailModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartsModule,
    OrdersModule,
    RecommendationsModule,
    ReportsModule,
    HealthModule,
  ],
})
export class AppModule {}

