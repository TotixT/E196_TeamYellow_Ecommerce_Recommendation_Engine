import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';

@Injectable()
export class SetPrimaryImageUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(
    productId: number,
    imageId: number,
  ): Promise<{ message: string }> {
    // Validate product exists
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    // Check image exists and belongs to this product
    const image = await this.productsRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundException(
        `Imagen con ID ${imageId} no encontrada en este producto`,
      );
    }

    if (image.isPrimary) {
      throw new BadRequestException('Esta imagen ya es la principal');
    }

    // Delegate to repository
    await this.productsRepository.setPrimaryImage(imageId, productId);

    return { message: 'Imagen principal actualizada exitosamente' };
  }
}
