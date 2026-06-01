import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { CloudinaryService } from '../../../../common/shared/cloudinary/cloudinary.service';
import { ProductImage } from '../../domain/entities/product.entity';

@Injectable()
export class UpdateProductImageUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    productId: number,
    imageId: number,
    file: Express.Multer.File,
  ): Promise<{ message: string; image: ProductImage }> {
    // Check product exists
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${productId} no encontrado`,
      );
    }

    // Check image exists and belongs to this product
    const existingImage = await this.productsRepository.findImageById(imageId);
    if (!existingImage || existingImage.productId !== productId) {
      throw new NotFoundException(`Imagen con ID ${imageId} no encontrada en este producto`);
    }

    // cloudinaryPublicId contains folder + publicId (e.g. eie/smartphones/1/img-1)
    // We split it to pass to the cloudinary service to force overwrite
    const fullPath = existingImage.cloudinaryPublicId;
    const lastSlashIndex = fullPath.lastIndexOf('/');
    
    let folder = '';
    let publicIdName = fullPath;
    
    if (lastSlashIndex !== -1) {
      folder = fullPath.substring(0, lastSlashIndex);
      publicIdName = fullPath.substring(lastSlashIndex + 1);
    }

    // Upload to Cloudinary (will overwrite existing file because of matching folder and publicId)
    const uploadResult = await this.cloudinaryService.uploadImage(
      file,
      folder,
      publicIdName,
    );

    // If it's the primary image, we also update the mainImage field on the product
    if (existingImage.isPrimary) {
      await this.productsRepository.updateMainImage(
        productId,
        uploadResult.url,
      );
    }

    // Update the image record in the database with the new URL 
    // Cloudinary changes the version tag in the URL (e.g. v123456 -> v123457)
    // This guarantees the frontend receives a new URL and busts its cache.
    await this.productsRepository.updateImageUrl(imageId, uploadResult.url);

    return { 
      message: 'Imagen actualizada y sobrescrita exitosamente', 
      image: {
        ...existingImage,
        imageUrl: uploadResult.url
      } 
    };
  }
}
