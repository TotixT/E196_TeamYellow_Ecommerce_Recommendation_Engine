import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../../domain/interfaces/i-users-repository.interface';
import { UpdateProfileDto } from '../dtos/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  // EIE-004 escenario 1: update profile WITHOUT closing session
  async execute(userId: number, dto: UpdateProfileDto) {
    const existing = await this.usersRepository.findById(userId);
    if (!existing) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updated = await this.usersRepository.updateProfile(userId, dto);
    return {
      message: '¡Perfil actualizado correctamente!',
      user: updated,
    };
  }
}
