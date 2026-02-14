import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // TODO: GET /products
  // TODO: GET /products/:id
  // TODO: POST /products
  // TODO: PATCH /products/:id
  // TODO: DELETE /products/:id
}
