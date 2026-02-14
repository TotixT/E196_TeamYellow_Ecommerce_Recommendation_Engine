import { Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // TODO: GET /categories
  // TODO: GET /categories/:id
  // TODO: POST /categories
  // TODO: PATCH /categories/:id
  // TODO: DELETE /categories/:id
}
