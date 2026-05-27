import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { CloudinaryService } from '../../../../common/shared/cloudinary/cloudinary.service';
import { ProductImage } from '../../domain/entities/product.entity';

@Injectable()
export class UploadProductImageUseCase {
  private readonly MAX_IMAGES = 5;

  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<{ message: string; images: ProductImage[] }> {
    // Validate product exists
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado`,
      );
    }

    // Check max images limit
    let currentCount = await this.productsRepository.countImages(productId);
    if (currentCount + files.length > this.MAX_IMAGES) {
      const allowed = this.MAX_IMAGES - currentCount;
      throw new BadRequestException(
        `El producto ya tiene ${currentCount} imágenes. Solo puedes subir ${allowed} imágenes más (Máximo ${this.MAX_IMAGES}).`,
      );
    }

    const uploadedImages: ProductImage[] = [];

    // Process files sequentially to maintain predictable ordering
    for (const file of files) {
      const newOrder = currentCount + 1;
      const isPrimary = currentCount === 0;

      // Build Cloudinary path: eie/cat-{categoryId}/prod-{productId}/img-{order}
      const folder = `eie/cat-${product.categoryId}/prod-${productId}`;
      const publicIdName = `img-${newOrder}`;

      // Upload to Cloudinary
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        folder,
        publicIdName,
      );

      // Save image record in DB
      const image = await this.productsRepository.addImage({
        productId,
        imageUrl: uploadResult.url,
        cloudinaryPublicId: uploadResult.publicId,
        order: newOrder,
        isPrimary,
      });

      uploadedImages.push(image);

      // If it's the first image, set it as mainImage on the product
      if (isPrimary) {
        await this.productsRepository.updateMainImage(
          productId,
          uploadResult.url,
        );
      }

      currentCount++;
    }

    return { 
      message: `${files.length} imagen(es) subida(s) exitosamente`, 
      images: uploadedImages 
    };
  }
}
