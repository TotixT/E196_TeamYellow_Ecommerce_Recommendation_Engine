import { Injectable, Inject } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  // EIE-003: Invalidate the JWT in DB so it cannot be reused
  async execute(token: string): Promise<{ message: string }> {
    await this.authRepository.invalidateSessionToken(token);
    return { message: 'Sesión cerrada exitosamente' };
  }
}
