// Domain entity — NO framework imports allowed here (EIE-019)

export enum ProductStatus {
  active = 'active',
  inactive = 'inactive',
}

export class Product {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: ProductStatus;
  mainImage?: string;
  purchaseCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  cloudinaryPublicId: string;
  order: number;
  isPrimary: boolean;
}

export class ProductWithImages extends Product {
  images: ProductImage[];
  categoryName?: string;
  categorySlug?: string;
}
