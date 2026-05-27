import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { CloudinaryService } from '../../../../common/shared/cloudinary/cloudinary.service';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(id: number): Promise<{ message: string }> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        await this.cloudinaryService.deleteImage(image.cloudinaryPublicId);
      }
    }

    // Soft delete the product
    await this.productsRepository.softDelete(id);

    return { message: 'Producto eliminado exitosamente' };
  }
}
