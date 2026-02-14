import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: GET /users
  // TODO: GET /users/:id
  // TODO: PATCH /users/:id
  // TODO: DELETE /users/:id
}
