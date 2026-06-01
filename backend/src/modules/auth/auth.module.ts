import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthRepository } from './infrastructure/repositories/auth.repository';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { VerifyAccountUseCase } from './application/use-cases/verify-account.use-case';
import { ResendVerificationUseCase } from './application/use-cases/resend-verification.use-case';
import { PrismaModule } from '../../database/prisma.module';
import { MailModule } from '../../common/shared/mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '24h') as any,
        },
      }),
    }),
    PrismaModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    // Use cases
    RegisterUseCase,
    LoginUseCase,
    LogoutUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    // Strategy
    JwtStrategy,
    // Repository — bound to interface token for DI
    { provide: 'IAuthRepository', useClass: AuthRepository },
    AuthRepository,
  ],
  // Export JwtModule so other modules can verify tokens if needed
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
