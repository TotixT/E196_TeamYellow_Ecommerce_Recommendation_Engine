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
    const verificationLink = `http://localhost:3000/verify-account?token=${token}`;
    await this.mailService.sendVerificationEmail(user.email, {
      userName: user.fullName,
      otpCode: code,
      verificationLink,
    });

    return {
      message: 'Código de verificación reenviado a tu correo.',
    };
  }
}
