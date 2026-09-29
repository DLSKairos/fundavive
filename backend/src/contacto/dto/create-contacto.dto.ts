import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class CreateContactoDto {
  @IsString()
  @Length(2, 150, { message: 'El nombre completo es requerido' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @IsString()
  @Length(3, 200, { message: 'El asunto es requerido' })
  asunto!: string;

  @IsString()
  @Length(10, 2000, { message: 'El mensaje debe tener al menos 10 caracteres' })
  mensaje!: string;
}
