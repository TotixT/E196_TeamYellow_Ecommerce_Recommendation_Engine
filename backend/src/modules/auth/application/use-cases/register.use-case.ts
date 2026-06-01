import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { RegisterDto } from '../dtos/register.dto';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { MailService } from '../../../../common/shared/mail/mail.service';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(
    dto: RegisterDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    const existing = await this.authRepository.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException(
        'Este correo ya está registrado. ¿Deseas iniciar sesión?',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    // User is created with 'inactive' status by default due to schema changes
    const user = await this.authRepository.createUser({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Generate secure token for URL
    const token = crypto.randomBytes(32).toString('hex');
    // Exactly 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.authRepository.createVerificationToken({
      userId: user.id,
      code,
      token,
      expiresAt,
    });

    // Send the verification email
    const verificationLink = `http://localhost:3000/verify-account?token=${token}`;
    await this.mailService.sendVerificationEmail(user.email, {
      userName: user.fullName,
      otpCode: code,
      verificationLink,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...safeUser } = user;

    return {
      message: 'Cuenta creada. Por favor, verifica tu correo electrónico.',
      user: safeUser,
    };
  }
}
