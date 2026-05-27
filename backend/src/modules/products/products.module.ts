import { Module } from '@nestjs/common';

import { ProductsController } from './infrastructure/controllers/products.controller';
import { ProductsRepository } from './infrastructure/repositories/products.repository';

import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from './application/use-cases/upload-product-image.use-case';
import { DeleteProductImageUseCase } from './application/use-cases/delete-product-image.use-case';
import { ToggleProductStatusUseCase } from './application/use-cases/toggle-product-status.use-case';
import { UpdateProductImageUseCase } from './application/use-cases/update-product-image.use-case';
import { SetPrimaryImageUseCase } from './application/use-cases/set-primary-image.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    // Use cases
    CreateProductUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UploadProductImageUseCase,
    DeleteProductImageUseCase,
    ToggleProductStatusUseCase,
    UpdateProductImageUseCase,
    SetPrimaryImageUseCase,
    // Repository — bound to interface token for DI
    { provide: 'IProductsRepository', useClass: ProductsRepository },
    ProductsRepository,
  ],
  exports: [ProductsRepository],
})
export class ProductsModule {}
