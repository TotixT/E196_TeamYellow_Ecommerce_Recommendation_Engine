import { Module } from '@nestjs/common';

import { CategoriesController } from './infrastructure/controllers/categories.controller';
import { CategoriesRepository } from './infrastructure/repositories/categories.repository';

import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from './application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { ToggleCategoryStatusUseCase } from './application/use-cases/toggle-category-status.use-case';

@Module({
  controllers: [CategoriesController],
  providers: [
    // Use cases
    CreateCategoryUseCase,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    UpdateCategoryUseCase,
    ToggleCategoryStatusUseCase,
    // Repository — bound to interface token for DI
    { provide: 'ICategoriesRepository', useClass: CategoriesRepository },
    CategoriesRepository,
  ],
  exports: [CategoriesRepository],
})
export class CategoriesModule {}
