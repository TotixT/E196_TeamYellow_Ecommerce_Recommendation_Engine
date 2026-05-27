import { Injectable, Inject } from '@nestjs/common';
import {
  ICategoriesRepository,
  PaginatedCategories,
} from '../../domain/interfaces/i-categories-repository.interface';
import { CategoriesQueryDto } from '../dtos/categories-query.dto';

@Injectable()
export class ListCategoriesUseCase {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async execute(query: CategoriesQueryDto): Promise<PaginatedCategories> {
    return this.categoriesRepository.findAll(query);
  }
}
