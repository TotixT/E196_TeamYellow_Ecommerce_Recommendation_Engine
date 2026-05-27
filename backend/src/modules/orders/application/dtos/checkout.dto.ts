import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de envío es obligatorio' })
  @MaxLength(150)
  shippingName: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección de envío es obligatoria' })
  @MaxLength(300)
  shippingAddress: string;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad de envío es obligatoria' })
  @MaxLength(100)
  shippingCity: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono de envío es obligatorio' })
  @MaxLength(20)
  shippingPhone: string;
}
