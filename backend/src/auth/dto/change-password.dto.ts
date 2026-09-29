import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  passwordActual!: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  passwordNueva!: string;

  @IsString()
  @IsNotEmpty({ message: 'La confirmación de la nueva contraseña es requerida' })
  passwordNuevaConfirmacion!: string;
}
