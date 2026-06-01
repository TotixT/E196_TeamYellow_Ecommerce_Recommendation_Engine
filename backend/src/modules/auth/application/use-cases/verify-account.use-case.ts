import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';

@Injectable()
export class VerifyAccountUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(codeOrToken: string): Promise<{ message: string }> {
    const verificationRecord =
      await this.authRepository.findVerificationToken(codeOrToken);

    if (!verificationRecord) {
      throw new BadRequestException(
        'Código o enlace de verificación inválido.',
      );
    }

    if (new Date() > verificationRecord.expiresAt) {
      throw new BadRequestException(
        'El código o enlace de verificación ha expirado.',
      );
    }

    // Activate the user
    await this.authRepository.activateUser(verificationRecord.userId);

    // Delete verification tokens for this user so they can't be reused
    await this.authRepository.deleteVerificationTokens(
      verificationRecord.userId,
    );

    return {
      message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.',
    };
  }
}
