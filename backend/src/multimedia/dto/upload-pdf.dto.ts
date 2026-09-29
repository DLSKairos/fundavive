import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UploadPdfDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo!: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
