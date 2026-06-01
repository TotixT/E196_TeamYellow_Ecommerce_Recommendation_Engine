import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { JwtOptionalGuard } from '../../../../common/guards/jwt-optional.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { DeleteProductImageUseCase } from '../../application/use-cases/delete-product-image.use-case';
import { ToggleProductStatusUseCase } from '../../application/use-cases/toggle-product-status.use-case';
import { UpdateProductImageUseCase } from '../../application/use-cases/update-product-image.use-case';
import { SetPrimaryImageUseCase } from '../../application/use-cases/set-primary-image.use-case';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';
import { ProductsQueryDto } from '../../application/dtos/products-query.dto';

import { ProductViewedEvent } from '../../../recommendations/application/listeners/behavior-events.listener';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class ProductsController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly uploadProductImageUseCase: UploadProductImageUseCase,
    private readonly deleteProductImageUseCase: DeleteProductImageUseCase,
    private readonly toggleProductStatusUseCase: ToggleProductStatusUseCase,
    private readonly updateProductImageUseCase: UpdateProductImageUseCase,
    private readonly setPrimaryImageUseCase: SetPrimaryImageUseCase,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // PUBLIC: GET /api/v1/products
  @Get('products')
  list(@Query() query: ProductsQueryDto) {
    return this.listProductsUseCase.execute(query);
  }

  // PUBLIC: GET /api/v1/products/:id
  @Get('products/:id')
  @UseGuards(JwtOptionalGuard)
  async getById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const product = await this.getProductUseCase.execute(id);

    // EIE-012: Asynchronous tracking of VIEW event
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = req.user?.id; // Might be undefined if public
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const sessionId = req.headers['x-session-id'];
    this.eventEmitter.emit(
      'product.viewed',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      new ProductViewedEvent(id, userId, sessionId),
    );

    return product;
  }

  // ADMIN: POST /api/v1/admin/products
  @Post('admin/products')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.createProductUseCase.execute(dto);
  }

  // ADMIN: PUT /api/v1/admin/products/:id
  @Put('admin/products/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductDto) {
    return this.updateProductUseCase.execute(id, dto);
  }

  // ADMIN: PATCH /api/v1/admin/products/:id/activate
  @Patch('admin/products/:id/activate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.toggleProductStatusUseCase.execute(id, 'activate');
  }

  // ADMIN: PATCH /api/v1/admin/products/:id/deactivate
  @Patch('admin/products/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.toggleProductStatusUseCase.execute(id, 'deactivate');
  }

  // ADMIN: DELETE /api/v1/admin/products/:id
  @Delete('admin/products/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.deleteProductUseCase.execute(id);
  }

  // ADMIN: POST /api/v1/admin/products/:id/images
  @Post('admin/products/:id/images')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit as requested
      fileFilter: (_req: any, file: any, cb: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, gif, webp)',
            ),
            false,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        cb(null, true);
      },
    }),
  )
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }
    return this.uploadProductImageUseCase.execute(id, files);
  }

  // ADMIN: PUT /api/v1/admin/products/:id/images/:imageId
  @Put('admin/products/:id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
      fileFilter: (_req: any, file: any, cb: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (jpg, jpeg, png, gif, webp)',
            ),
            false,
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        cb(null, true);
      },
    }),
  )
  updateImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }
    return this.updateProductImageUseCase.execute(id, imageId, file);
  }

  // ADMIN: DELETE /api/v1/admin/products/:id/images/:imageId
  @Delete('admin/products/:id/images/:imageId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.deleteProductImageUseCase.execute(id, imageId);
  }

  // ADMIN: PATCH /api/v1/admin/products/:id/images/:imageId/primary
  @Patch('admin/products/:id/images/:imageId/primary')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setPrimaryImage(
    @Param('id', ParseIntPipe) id: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.setPrimaryImageUseCase.execute(id, imageId);
  }
}
