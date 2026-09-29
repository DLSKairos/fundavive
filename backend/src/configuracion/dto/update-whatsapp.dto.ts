import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWhatsappDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPais?: string;

  @IsString({ message: 'El número de WhatsApp es requerido' })
  @MaxLength(20)
  numero!: string;

  @IsOptional()
  @IsString()
  mensajePredeterminado?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
