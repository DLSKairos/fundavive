import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSeccionItemDto {
  @IsString()
  @MaxLength(100)
  seccion!: string;

  @IsOptional()
  @IsString()
  contenido?: string | null;

  @IsInt()
  orden!: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string | null;

  @IsBoolean()
  activo!: boolean;
}
