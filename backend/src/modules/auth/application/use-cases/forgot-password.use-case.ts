import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { MailService } from '../../../../common/shared/mail/mail.service';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);

  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async execute(
    dto: ForgotPasswordDto,
  ): Promise<{ message: string; email: string }> {
    const user = await this.authRepository.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new NotFoundException(
        'No encontramos una cuenta asociada a este correo electrónico. Verifica que esté bien escrito o regístrate.',
      );
    }

    // Generate a short-lived JWT token (15 minutes) for password reset
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'password-reset' },
      { expiresIn: '15m' },
    );

    // Send the reset email — uses FRONTEND_URL for the link button
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.mailService.sendPasswordResetEmail(user.email, {
      userName: user.fullName,
      resetLink,
      resetToken,
    });

    this.logger.log(`Password reset email sent to ${user.email}`);

    // Mask the email for the response (ej: s***o@gmail.com)
    const [localPart, domain] = user.email.split('@');
    const maskedLocal =
      localPart.length <= 2
        ? localPart[0] + '***'
        : localPart[0] + '***' + localPart[localPart.length - 1];
    const maskedEmail = `${maskedLocal}@${domain}`;

    return {
      message: `Hemos enviado un enlace de recuperación a tu correo electrónico. El enlace expira en 15 minutos. Revisa tu bandeja de entrada (y la carpeta de spam).`,
      email: maskedEmail,
    };
  }
}
