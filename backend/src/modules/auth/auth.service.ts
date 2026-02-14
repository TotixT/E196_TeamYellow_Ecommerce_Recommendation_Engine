import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  // TODO: Implement login logic
  // TODO: Implement register logic
  // TODO: Implement JWT token generation
  // TODO: Implement token refresh logic
}
