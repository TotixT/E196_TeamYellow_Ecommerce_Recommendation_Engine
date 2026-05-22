import { Injectable, Inject } from '@nestjs/common';
import { IUsersRepository } from '../../domain/interfaces/i-users-repository.interface';
import { UsersQueryDto } from '../dtos/users-query.dto';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('IUsersRepository')
    private readonly usersRepository: IUsersRepository,
  ) {}

  // EIE-005 escenario 1: paginated list with status filter and name/email search
  async execute(query: UsersQueryDto) {
    return this.usersRepository.listUsers({
      status: query.status,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
  }
}
