import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { ListCategoriesUseCase } from '../../application/use-cases/list-categories.use-case';
import { GetCategoryUseCase } from '../../application/use-cases/get-category.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { ToggleCategoryStatusUseCase } from '../../application/use-cases/toggle-category-status.use-case';
import { CreateCategoryDto } from '../../application/dtos/create-category.dto';
import { UpdateCategoryDto } from '../../application/dtos/update-category.dto';
import { CategoriesQueryDto } from '../../application/dtos/categories-query.dto';

@Controller()
export class CategoriesController {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly toggleCategoryStatusUseCase: ToggleCategoryStatusUseCase,
  ) {}

  // PUBLIC: GET /api/v1/categories
  @Get('categories')
  list(@Query() query: CategoriesQueryDto) {
    return this.listCategoriesUseCase.execute(query);
  }

  // PUBLIC: GET /api/v1/categories/:id
  @Get('categories/:id')
  getById(@Param('id', ParseIntPipe) id: number) {
    return this.getCategoryUseCase.execute(id);
  }

  // ADMIN: POST /api/v1/admin/categories
  @Post('admin/categories')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(dto);
  }

  // ADMIN: PUT /api/v1/admin/categories/:id
  @Put('admin/categories/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(id, dto);
  }

  // ADMIN: PATCH /api/v1/admin/categories/:id/activate
  @Patch('admin/categories/:id/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.toggleCategoryStatusUseCase.execute(id, 'activate');
  }

  // ADMIN: PATCH /api/v1/admin/categories/:id/deactivate
  @Patch('admin/categories/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.toggleCategoryStatusUseCase.execute(id, 'deactivate');
  }
}
