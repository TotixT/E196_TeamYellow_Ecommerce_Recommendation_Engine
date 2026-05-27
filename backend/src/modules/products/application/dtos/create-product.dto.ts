import {
  IsInt,
  IsString,
  IsNumber,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  @Min(1, { message: 'El ID de categoría es requerido' })
  categoryId: number;

  @IsString({ message: 'El nombre del producto es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede tener más de 200 caracteres' })
  name: string;

  @IsString({ message: 'La descripción del producto es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  description: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con máximo 2 decimales' },
  )
  @Min(0.01, { message: 'El precio debe ser mayor a 0' })
  price: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock: number;
}
