import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoVoluntario } from "@prisma/client";

export class UpdateEstadoVoluntarioDto {
  @IsEnum(EstadoVoluntario, {
    message: `Estado inválido. Valores permitidos: ${Object.values(EstadoVoluntario).join(', ')}`,
  })
  estado!: EstadoVoluntario;

  @IsOptional()
  @IsString()
  notasAdmin?: string;
}
