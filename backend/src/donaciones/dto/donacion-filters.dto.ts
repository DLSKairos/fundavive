import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { EstadoDonacion } from "@prisma/client";

/** Convierte 'true'/'false' de query string a boolean real (evita el bug de `Boolean('false') === true`). */
function toOptionalBoolean({ value }: { value: unknown }): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

export class DonacionFiltersDto {
  @IsOptional()
  @IsEnum(EstadoDonacion)
  estado?: EstadoDonacion;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montoMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  montoMax?: number;

  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  esRecurrente?: boolean;
}
