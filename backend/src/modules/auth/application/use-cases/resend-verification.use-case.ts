import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { MailService } from '../../../../common/shared/mail/mail.service';

@Injectable()
export class ResendVerificationUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.authRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (user.status === 'active') {
      throw new BadRequestException('Esta cuenta ya está verificada.');
    }

    // Generate new OTP and token
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete existing tokens to prevent multiple valid tokens
    await this.authRepository.deleteVerificationTokens(user.id);

    await this.authRepository.createVerificationToken({
      userId: user.id,
      code,
      token,
      expiresAt,
    });

    // Send the verification email again
    const verificationLink = `https://e196-team-yellow-ecommerce-recommen.vercel.app/verify-account?token=${token}`;

    try {
      await this.mailService.sendVerificationEmail(user.email, {
        userName: user.fullName,
        otpCode: code,
        verificationLink,
      });
    } catch (error) {
      console.error(
        'Failed to send verification email (likely missing SMTP credentials). User token created anyway.',
        error,
      );
    }

    return {
      message: 'Código de verificación reenviado a tu correo.',
    };
  }
}
