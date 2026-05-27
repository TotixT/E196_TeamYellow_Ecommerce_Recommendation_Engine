import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { ICategoriesRepository } from '../../domain/interfaces/i-categories-repository.interface';
import { CreateCategoryDto } from '../dtos/create-category.dto';
import { Category } from '../../domain/entities/category.entity';
import { slugify } from '../../../../common/utils/slugify';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async execute(
    dto: CreateCategoryDto,
  ): Promise<{ message: string; category: Category }> {
    // Check name uniqueness (case-insensitive handled by DB unique constraint)
    const existing = await this.categoriesRepository.findByName(dto.name.trim());
    if (existing) {
      throw new ConflictException('Ya existe una categoría con este nombre');
    }

    const slug = slugify(dto.name);

    // Check slug uniqueness
    const existingSlug = await this.categoriesRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictException(
        'El slug generado ya existe. Intente con otro nombre',
      );
    }

    const category = await this.categoriesRepository.create({
      name: dto.name.trim(),
      slug,
      description: dto.description?.trim(),
    });

    return { message: 'Categoría creada exitosamente', category };
  }
}
