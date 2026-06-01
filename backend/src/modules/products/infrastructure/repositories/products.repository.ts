import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import {
  IProductsRepository,
  PaginatedProducts,
  ProductsFilter,
} from '../../domain/interfaces/i-products-repository.interface';
import {
  Product,
  ProductImage,
  ProductWithImages,
} from '../../domain/entities/product.entity';

@Injectable()
export class ProductsRepository implements IProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapProduct(raw: any): Product {
    return {
      id: raw.id,
      categoryId: raw.categoryId,
      name: raw.name,
      description: raw.description,
      price: Number(raw.price),
      stock: raw.stock,
      status: raw.status,
      mainImage: raw.mainImage ?? undefined,
      purchaseCount: raw.purchaseCount,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? undefined,
    };
  }

  private mapProductWithImages(raw: any): ProductWithImages {
    return {
      ...this.mapProduct(raw),
      images: (raw.images ?? []).map((img: any) => ({
        id: img.id,
        productId: img.productId,
        imageUrl: img.imageUrl,
        cloudinaryPublicId: img.cloudinaryPublicId,
        order: img.order,
        isPrimary: img.isPrimary,
      })),
      categoryName: raw.category?.name,
      categorySlug: raw.category?.slug,
    };
  }

  private mapImage(raw: any): ProductImage {
    return {
      id: raw.id,
      productId: raw.productId,
      imageUrl: raw.imageUrl,
      cloudinaryPublicId: raw.cloudinaryPublicId,
      order: raw.order,
      isPrimary: raw.isPrimary,
    };
  }

  async findAll(filter: ProductsFilter): Promise<PaginatedProducts> {
    const {
      categoryId,
      status,
      search,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
      ...(status && { status: status as any }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    // Map sortBy to Prisma field names
    const orderByField =
      sortBy === 'purchaseCount' ? 'purchaseCount' : sortBy;

    const [products, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { name: true, slug: true } },
        },
        skip,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((p) => this.mapProductWithImages(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<ProductWithImages | null> {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: { select: { name: true, slug: true } },
      },
    });
    return product ? this.mapProductWithImages(product) : null;
  }

  async create(data: {
    categoryId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Promise<Product> {
    const product = await this.prisma.product.create({ data });
    return this.mapProduct(product);
  }

  async update(
    id: number,
    data: {
      categoryId?: number;
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ): Promise<Product> {
    const product = await this.prisma.product.update({ where: { id }, data });
    return this.mapProduct(product);
  }

  async updateStatus(id: number, status: string): Promise<Product> {
    const product = await this.prisma.product.update({
      where: { id },
      data: { status: status as any },
    });
    return this.mapProduct(product);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.$transaction([
      // 1. Borrar permanentemente los registros de imágenes de la BD (ya que se borraron de Cloudinary)
      this.prisma.productImage.deleteMany({
        where: { productId: id },
      }),
      // 2. Hacer soft delete del producto, pasarlo a inactivo y quitarle la imagen principal
      this.prisma.product.update({
        where: { id },
        data: { 
          deletedAt: new Date(),
          status: 'inactive',
          mainImage: null
        },
      })
    ]);
  }

  // --- Image operations ---

  async addImage(data: {
    productId: number;
    imageUrl: string;
    cloudinaryPublicId: string;
    order: number;
    isPrimary: boolean;
  }): Promise<ProductImage> {
    const image = await this.prisma.productImage.create({ data });
    return this.mapImage(image);
  }

  async removeImage(imageId: number): Promise<ProductImage | null> {
    const image = await this.prisma.productImage.delete({
      where: { id: imageId },
    });
    return image ? this.mapImage(image) : null;
  }

  async findImageById(imageId: number): Promise<ProductImage | null> {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
    return image ? this.mapImage(image) : null;
  }

  async updateMainImage(
    productId: number,
    imageUrl: string | null,
  ): Promise<void> {
    await this.prisma.product.update({
      where: { id: productId },
      data: { mainImage: imageUrl },
    });
  }

  async countImages(productId: number): Promise<number> {
    return this.prisma.productImage.count({ where: { productId } });
  }

  async findFirstImage(productId: number): Promise<ProductImage | null> {
    const image = await this.prisma.productImage.findFirst({
      where: { productId },
      orderBy: { order: 'asc' },
    });
    return image ? this.mapImage(image) : null;
  }

  async setPrimaryImage(
    imageId: number,
    productId: number,
  ): Promise<void> {
    const image = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) return;

    await this.prisma.$transaction([
      // First, set all images for this product to non-primary
      this.prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      }),
      // Then set the specified image as primary
      this.prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
      // Finally, update the product's mainImage URL
      this.prisma.product.update({
        where: { id: productId },
        data: { mainImage: image.imageUrl },
      })
    ]);
  }

  async updateImageUrl(imageId: number, newUrl: string): Promise<void> {
    await this.prisma.productImage.update({
      where: { id: imageId },
      data: { imageUrl: newUrl },
    });
  }

  // --- Category lookup (avoids cross-module dependency) ---

  async findCategoryById(
    id: number,
  ): Promise<{ id: number; slug: string; status: string } | null> {
    return this.prisma.category.findFirst({
      where: { id },
      select: { id: true, slug: true, status: true },
    });
  }
}
