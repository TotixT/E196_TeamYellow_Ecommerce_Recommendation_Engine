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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      id: user.id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      fullName: user.fullName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      email: user.email,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      phone: user.phone ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      address: user.address ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      city: user.city ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: user.role,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      status: user.status,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      createdAt: user.createdAt,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { status: status as any },
      select: PROFILE_SELECT,
    });
    return this.map(user);
  }
}
