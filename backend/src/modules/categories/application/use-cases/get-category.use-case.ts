import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICategoriesRepository } from '../../domain/interfaces/i-categories-repository.interface';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class GetCategoryUseCase {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async execute(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }
}
