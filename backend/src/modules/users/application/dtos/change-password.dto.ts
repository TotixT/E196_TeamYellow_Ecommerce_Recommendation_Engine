import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  currentPassword: string;

  // Same password rules as registration (EIE-016)
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100)
  @Matches(/(?=.*[A-Z])/, {
    message: 'La contraseña debe tener al menos una letra mayúscula',
  })
  // eslint-disable-next-line no-useless-escape
  @Matches(/(?=.*[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~])/, {
    message: 'La contraseña debe tener al menos un carácter especial',
  })
  newPassword: string;
}
