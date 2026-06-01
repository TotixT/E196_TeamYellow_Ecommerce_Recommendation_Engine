import {
  Product,
  ProductImage,
  ProductWithImages,
} from '../entities/product.entity';

export interface PaginatedProducts {
  data: ProductWithImages[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductsFilter {
  categoryId?: number;
  status?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IProductsRepository {
  findAll(filter: ProductsFilter): Promise<PaginatedProducts>;
  findById(id: number): Promise<ProductWithImages | null>;
  create(data: {
    categoryId: number;
    name: string;
    description: string;
    price: number;
    stock: number;
  }): Promise<Product>;
  update(
    id: number,
    data: {
      categoryId?: number;
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
    },
  ): Promise<Product>;
  updateStatus(id: number, status: string): Promise<Product>;
  softDelete(id: number): Promise<void>;

  // Image operations
  addImage(data: {
    productId: number;
    imageUrl: string;
    cloudinaryPublicId: string;
    order: number;
    isPrimary: boolean;
  }): Promise<ProductImage>;
  removeImage(imageId: number): Promise<ProductImage | null>;
  findImageById(imageId: number): Promise<ProductImage | null>;
  updateMainImage(productId: number, imageUrl: string | null): Promise<void>;
  countImages(productId: number): Promise<number>;
  findFirstImage(productId: number): Promise<ProductImage | null>;
  setPrimaryImage(imageId: number, productId: number): Promise<void>;
  updateImageUrl(imageId: number, newUrl: string): Promise<void>;

  // Category lookup (avoids cross-module dependency)
  findCategoryById(
    id: number,
  ): Promise<{ id: number; slug: string; status: string } | null>;
}
