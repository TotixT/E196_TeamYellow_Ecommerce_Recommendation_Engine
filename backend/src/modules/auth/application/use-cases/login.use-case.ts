import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dtos/login.dto';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';

// EIE-002 escenario 2: NEVER reveal which field is wrong
const GENERIC_CREDENTIALS_ERROR = 'Las credenciales ingresadas son incorrectas';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto): Promise<{
    accessToken: string;
    user: { id: number; fullName: string; email: string; role: string };
  }> {
    // Always use generic error — do NOT reveal if the email exists or not
    const user = await this.authRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException(GENERIC_CREDENTIALS_ERROR);
    }

    // EIE-002 escenario 3: inactive account — specific message ONLY after we
    // know the user exists, so we don't reveal email existence to attackers
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (user.status === 'inactive') {
      throw new ForbiddenException(
        'Tu cuenta se encuentra desactivada. Contacta al administrador.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(GENERIC_CREDENTIALS_ERROR);
    }

    // EIE-016: JWT signed, 24h expiration
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    // Store session token for logout invalidation (EIE-003)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await this.authRepository.createSessionToken({
      userId: user.id,
      token: accessToken,
      expiresAt,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
