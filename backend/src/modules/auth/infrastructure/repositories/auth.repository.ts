import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IAuthRepository } from '../../domain/interfaces/i-auth-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      passwordHash: user.passwordHash,
      phone: user.phone ?? undefined,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      role: user.role as any,
      status: user.status as any,
      failedAttempts: user.failedAttempts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt ?? undefined,
    };
  }

  async createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as any,
      status: user.status as any,
      failedAttempts: user.failedAttempts,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createSessionToken(data: {
    userId: number;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.prisma.sessionToken.create({ data });
  }

  async findSessionToken(
    token: string,
  ): Promise<{ id: string; isActive: boolean } | null> {
    return this.prisma.sessionToken.findUnique({
      where: { token },
      select: { id: true, isActive: true },
    });
  }

  async invalidateSessionToken(token: string): Promise<void> {
    await this.prisma.sessionToken.updateMany({
      where: { token },
      data: { isActive: false },
    });
  }
}
