import { Category } from '../entities/category.entity';

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesFilter {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICategoriesRepository {
  findAll(filter: CategoriesFilter): Promise<PaginatedCategories>;
  findById(id: number): Promise<Category | null>;
  findBySlug(slug: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<Category>;
  update(
    id: number,
    data: { name?: string; slug?: string; description?: string },
  ): Promise<Category>;
  updateStatus(id: number, status: string): Promise<Category>;
}
