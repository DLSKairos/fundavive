import {
  IsArray,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateVoluntarioDto {
  @IsString()
  @Length(2, 150, { message: 'El nombre debe tener entre 2 y 150 caracteres' })
  nombreCompleto!: string;

  @IsString()
  @Length(5, 20, { message: 'La cédula debe tener entre 5 y 20 caracteres' })
  cedula!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @Length(7, 20, { message: 'El teléfono debe tener entre 7 y 20 caracteres' })
  telefono!: string;

  @IsString()
  @Length(2, 100, { message: 'La ciudad debe tener entre 2 y 100 caracteres' })
  ciudad!: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccion?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nivelEstudios?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  profesionOcupacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  habilidadesEspeciales?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  disponibilidadHoraria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  motivacion?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasInteres?: string[];
}
