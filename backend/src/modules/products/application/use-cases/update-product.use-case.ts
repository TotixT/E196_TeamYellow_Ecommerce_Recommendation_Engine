import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { UpdateProductDto } from '../dtos/update-product.dto';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(
    id: number,
    dto: UpdateProductDto,
  ): Promise<{ message: string; product: Product }> {
    const existing = await this.productsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // If changing category, validate it exists and is active
    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.productsRepository.findCategoryById(
        dto.categoryId,
      );
      if (!category) {
        throw new NotFoundException(
          `Categoría con ID ${dto.categoryId} no encontrada`,
        );
      }
      if (category.status !== 'active') {
        throw new BadRequestException(
          'No se puede mover el producto a una categoría inactiva',
        );
      }
    }

    const product = await this.productsRepository.update(id, {
      ...(dto.categoryId && { categoryId: dto.categoryId }),
      ...(dto.name && { name: dto.name.trim() }),
      ...(dto.description && { description: dto.description.trim() }),
      ...(dto.price !== undefined && { price: dto.price }),
      ...(dto.stock !== undefined && { stock: dto.stock }),
    });

    return { message: 'Producto actualizado exitosamente', product };
  }
}
