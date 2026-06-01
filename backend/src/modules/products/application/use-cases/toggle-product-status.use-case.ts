import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { IProductsRepository } from '../../domain/interfaces/i-products-repository.interface';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class ToggleProductStatusUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(
    id: number,
    action: 'activate' | 'deactivate',
  ): Promise<{ message: string; product: Product }> {
    const existing = await this.productsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    const newStatus = action === 'activate' ? 'active' : 'inactive';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (existing.status === newStatus) {
      const statusLabel = action === 'activate' ? 'activo' : 'inactivo';
      throw new BadRequestException(
        `El producto ya se encuentra ${statusLabel}`,
      );
    }

    const product = await this.productsRepository.updateStatus(id, newStatus);

    const statusLabel = action === 'activate' ? 'activado' : 'desactivado';
    return {
      message: `Producto ${statusLabel} exitosamente`,
      product,
    };
  }
}
