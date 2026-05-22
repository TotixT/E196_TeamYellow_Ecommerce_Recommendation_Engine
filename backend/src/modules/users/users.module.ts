import { Module } from '@nestjs/common';

import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersRepository } from './infrastructure/repositories/users.repository';

import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { ToggleUserStatusUseCase } from './application/use-cases/toggle-user-status.use-case';

@Module({
  controllers: [UsersController],
  providers: [
    // Use cases
    GetProfileUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    ListUsersUseCase,
    ToggleUserStatusUseCase,
    // Repository — bound to interface token for DI
    { provide: 'IUsersRepository', useClass: UsersRepository },
    UsersRepository,
  ],
  exports: [GetProfileUseCase],
})
export class UsersModule {}
