import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { CreateProductDto } from '../dtos/create-product.dto';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(
    dto: CreateProductDto,
  ): Promise<{ message: string; product: Product }> {
    // Validate category exists and is active
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
        'No se puede crear un producto en una categoría inactiva',
      );
    }

    const product = await this.productsRepository.create({
      categoryId: dto.categoryId,
      name: dto.name.trim(),
      description: dto.description.trim(),
      price: dto.price,
      stock: dto.stock,
    });

    return { message: 'Producto creado exitosamente', product };
  }
}
