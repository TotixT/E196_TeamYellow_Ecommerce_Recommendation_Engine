import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { CloudinaryService } from '../../../../common/shared/cloudinary/cloudinary.service';

@Injectable()
export class DeleteProductImageUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    productId: number,
    imageId: number,
  ): Promise<{ message: string }> {
    // Find the image
    const image = await this.productsRepository.findImageById(imageId);
    if (!image || image.productId !== productId) {
      throw new NotFoundException(
        `Imagen con ID ${imageId} no encontrada para el producto ${productId}`,
      );
    }

    // Delete from Cloudinary
    await this.cloudinaryService.deleteImage(image.cloudinaryPublicId);

    // Remove from DB
    await this.productsRepository.removeImage(imageId);

    // If it was the primary image, re-assign to the next available image
    if (image.isPrimary) {
      const nextImage =
        await this.productsRepository.findFirstImage(productId);
      if (nextImage) {
        await this.productsRepository.setPrimaryImage(nextImage.id, productId);
        await this.productsRepository.updateMainImage(
          productId,
          nextImage.imageUrl,
        );
      } else {
        // No more images, clear mainImage
        await this.productsRepository.updateMainImage(productId, null);
      }
    }

    return { message: 'Imagen eliminada exitosamente' };
  }
}
