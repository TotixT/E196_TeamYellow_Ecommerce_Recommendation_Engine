import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IUsersRepository } from '../../domain/interfaces/i-users-repository.interface';

@Injectable()
export class ToggleUserStatusUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  // EIE-005 escenarios 2 y 3: activate / deactivate user (soft status change)
  async execute(userId: number, action: 'activate' | 'deactivate', currentUserId?: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Prevent self-deactivation
    if (action === 'deactivate' && currentUserId && currentUserId === userId) {
      throw new BadRequestException('No puedes desactivar tu propia cuenta de administrador');
    }

    if (action === 'deactivate' && user.status === 'inactive') {
      throw new BadRequestException('El usuario ya se encuentra desactivado');
    }
    if (action === 'activate' && user.status === 'active') {
      throw new BadRequestException('El usuario ya se encuentra activo');
    }

    const newStatus = action === 'activate' ? 'active' : 'inactive';
    await this.usersRepository.updateStatus(userId, newStatus);

    const message =
      action === 'activate'
        ? 'Usuario activado exitosamente'
        : 'Usuario desactivado exitosamente';

    return { message };
  }
}
