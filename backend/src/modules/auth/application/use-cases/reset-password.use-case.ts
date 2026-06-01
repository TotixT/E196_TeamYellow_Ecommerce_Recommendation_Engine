import {
  Injectable,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: ResetPasswordDto): Promise<{ message: string }> {
    // 1. Verify the token is valid and not expired
    let payload: { sub: number; email: string; purpose: string };

    try {
      payload = this.jwtService.verify(dto.token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        'El enlace de recuperación ha expirado o no es válido. Solicita uno nuevo.',
      );
    }

    // 2. Verify the token purpose is password-reset (anti-tampering)
    if (payload.purpose !== 'password-reset') {
      throw new BadRequestException(
        'Token inválido. Este token no es para restablecer contraseña.',
      );
    }

    // 3. Find the user
    const user = await this.authRepository.findByEmail(payload.email);
    if (!user) {
      throw new BadRequestException(
        'No se encontró el usuario asociado a este enlace.',
      );
    }

    // 4. Hash the new password with bcrypt cost 12 (EIE-016)
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    // 5. Update the password in the database
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // 6. Invalidate all existing session tokens for security
    await this.prisma.sessionToken.updateMany({
      where: { userId: user.id, isActive: true },
      data: { isActive: false },
    });

    this.logger.log(`Password successfully reset for user ${user.email}`);

    return {
      message:
        'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    };
  }
}
