import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNoticiasModalDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El subtítulo es requerido' })
  subtitulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La URL de destino es requerida' })
  urlDestino!: string;

  @IsString()
  @IsNotEmpty({ message: 'La etiqueta del botón es requerida' })
  etiquetaBoton!: string;

  @IsOptional()
  @IsString()
  badgeTexto?: string;

  @IsOptional()
  @IsString()
  highlightTexto?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
