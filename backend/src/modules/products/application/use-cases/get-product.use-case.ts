import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { ProductWithImages } from '../../domain/entities/product.entity';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(id: number): Promise<ProductWithImages> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return product;
  }
}
