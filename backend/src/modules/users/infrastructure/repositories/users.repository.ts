import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  IUsersRepository,
  PaginatedUsers,
  UsersFilter,
} from '../../domain/interfaces/i-users-repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';

// Fields selected for public profile (never expose passwordHash)
const PROFILE_SELECT = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  address: true,
  city: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private map(user: any): UserProfile {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? undefined,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: number): Promise<UserProfile | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: PROFILE_SELECT,
    });
    return user ? this.map(user) : null;
  }

  async updateProfile(
    id: number,
    data: Partial<Pick<UserProfile, 'fullName' | 'phone' | 'address' | 'city'>>,
  ): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: PROFILE_SELECT,
    });
    return this.map(user);
  }

  async updatePassword(id: number, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async findPasswordHash(id: number): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { passwordHash: true },
    });
    return user?.passwordHash ?? null;
  }

  async listUsers(filter: UsersFilter): Promise<PaginatedUsers> {
    const { status, search, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: PROFILE_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.map(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: number, status: string): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: PROFILE_SELECT,
    });
    return this.map(user);
  }
}
