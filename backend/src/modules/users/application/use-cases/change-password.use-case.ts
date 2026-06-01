import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUsersRepository } from '../../domain/interfaces/i-users-repository.interface';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: number, dto: ChangePasswordDto) {
    const currentHash = await this.usersRepository.findPasswordHash(userId);
    if (!currentHash) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // EIE-004 escenario 3: verify current password first
    const isCurrentValid = await bcrypt.compare(
      dto.currentPassword,
      currentHash,
    );
    if (!isCurrentValid) {
      throw new BadRequestException(
        'La contraseña actual ingresada es incorrecta',
      );
    }

    // EIE-016: bcrypt cost 12 always
    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.usersRepository.updatePassword(userId, newHash);

    return { message: '¡Contraseña actualizada!' };
  }
}
