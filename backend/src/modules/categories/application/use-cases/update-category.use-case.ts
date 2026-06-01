import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { ICategoriesRepository } from '../../domain/interfaces/i-categories-repository.interface';
import { UpdateCategoryDto } from '../dtos/update-category.dto';
import { Category } from '../../domain/entities/category.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { slugify } from '../../../../common/utils/slugify';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateCategoryDto,
  ): Promise<{ message: string; category: Category }> {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    const updateData: { name?: string; slug?: string; description?: string } =
      {};

    if (dto.name && dto.name.trim() !== existing.name) {
      // Check name uniqueness
      const duplicate = await this.categoriesRepository.findByName(
        dto.name.trim(),
      );
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Ya existe una categoría con este nombre');
      }
      updateData.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description?.trim();
    }

    const category = await this.categoriesRepository.update(id, updateData);

    return { message: 'Categoría actualizada exitosamente', category };
  }
}
