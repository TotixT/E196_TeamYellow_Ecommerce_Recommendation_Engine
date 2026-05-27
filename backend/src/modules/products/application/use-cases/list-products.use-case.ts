import { Injectable, Inject } from '@nestjs/common';
import {
  IProductsRepository,
  PaginatedProducts,
} from '../../domain/interfaces/i-products-repository.interface';
import { ProductsQueryDto } from '../dtos/products-query.dto';

@Injectable()
export class ListProductsUseCase {
  constructor(
    @Inject('IProductsRepository')
    private readonly productsRepository: IProductsRepository,
  ) {}

  async execute(query: ProductsQueryDto): Promise<PaginatedProducts> {
    return this.productsRepository.findAll(query);
  }
}
