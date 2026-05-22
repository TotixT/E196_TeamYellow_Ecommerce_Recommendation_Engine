import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUsersRepository } from '../../domain/interfaces/i-users-repository.interface';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  async execute(userId: number) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
