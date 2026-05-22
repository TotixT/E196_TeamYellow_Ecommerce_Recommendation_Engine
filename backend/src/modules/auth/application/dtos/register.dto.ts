import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre completo es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(120, { message: 'El nombre no puede tener más de 120 caracteres' })
  fullName: string;

  @IsEmail({}, { message: 'Ingresa un correo electrónico válido' })
  @MaxLength(180, { message: 'El correo es demasiado largo' })
  email: string;

  // EIE-001 escenario 3: min 8 chars, uppercase, special char
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
  password: string;
}
