import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../dtos/register.dto';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
  ) {}

  async execute(
    dto: RegisterDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    // EIE-001 escenario 2: check email uniqueness
    const existing = await this.authRepository.findByEmail(
      dto.email.toLowerCase(),
    );
    if (existing) {
      throw new ConflictException(
        'Este correo ya está registrado. ¿Deseas iniciar sesión?',
      );
    }

    // EIE-016 regla 1: bcrypt cost 12, NEVER plain text
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.authRepository.createUser({
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      passwordHash,
    });

    // Never expose passwordHash in the response
    const { passwordHash: _, ...safeUser } = user;

    return {
      message: 'Cuenta creada exitosamente',
      user: safeUser,
    };
  }
}
