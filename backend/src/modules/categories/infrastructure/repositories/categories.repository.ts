import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  ICategoriesRepository,
  PaginatedCategories,
  CategoriesFilter,
} from '../../domain/interfaces/i-categories-repository.interface';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class CategoriesRepository implements ICategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private map(raw: any): Category {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description ?? undefined,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  async findAll(filter: CategoriesFilter): Promise<PaginatedCategories> {
    const { status, search, page = 1, limit = 10 } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [categories, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories.map((c) => this.map(c)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    return category ? this.map(category) : null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    return category ? this.map(category) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({ where: { name } });
    return category ? this.map(category) : null;
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Category> {
    const category = await this.prisma.category.create({ data });
    return this.map(category);
  }

  async update(
    id: number,
    data: { name?: string; slug?: string; description?: string },
  ): Promise<Category> {
    const category = await this.prisma.category.update({ where: { id }, data });
    return this.map(category);
  }

  async updateStatus(id: number, status: string): Promise<Category> {
    const category = await this.prisma.category.update({
      where: { id },
      data: { status: status as any },
    });
    return this.map(category);
  }
}
