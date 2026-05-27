import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ICategoriesRepository } from '../../domain/interfaces/i-categories-repository.interface';
import { Category } from '../../domain/entities/category.entity';

@Injectable()
export class ToggleCategoryStatusUseCase {
  constructor(
    @Inject('ICategoriesRepository')
    private readonly categoriesRepository: ICategoriesRepository,
  ) {}

  async execute(
    id: number,
    action: 'activate' | 'deactivate',
  ): Promise<{ message: string; category: Category }> {
    const existing = await this.categoriesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    const newStatus = action === 'activate' ? 'active' : 'inactive';
    
    if (existing.status === newStatus) {
      const statusLabel = action === 'activate' ? 'activa' : 'inactiva';
      throw new BadRequestException(`La categoría ya se encuentra ${statusLabel}`);
    }
    const category = await this.categoriesRepository.updateStatus(id, newStatus);

    const statusLabel = action === 'activate' ? 'activada' : 'desactivada';
    return {
      message: `Categoría ${statusLabel} exitosamente`,
      category,
    };
  }
}
