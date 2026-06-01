// Port (interface) — use cases depend on this, NOT on the concrete Prisma implementation
import { User } from '../entities/user.entity';

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;
  createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<User>;
  createSessionToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
  findSessionToken(
    token: string,
  ): Promise<{ id: string; isActive: boolean } | null>;
  invalidateSessionToken(token: string): Promise<void>;
  createVerificationToken(data: {
    userId: number;
    code: string;
    token: string;
    expiresAt: Date;
  }): Promise<void>;
  findVerificationToken(codeOrToken: string): Promise<{
    userId: number;
    code: string;
    token: string;
    expiresAt: Date;
  } | null>;
  activateUser(userId: number): Promise<void>;
  deleteVerificationTokens(userId: number): Promise<void>;
}
