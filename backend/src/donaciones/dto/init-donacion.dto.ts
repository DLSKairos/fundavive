import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { FrecuenciaDonacion } from "@prisma/client";

export class InitDonacionDto {
  @IsString()
  @Length(2, 150, { message: 'El nombre completo es requerido' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cedula?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1000, { message: 'El monto mínimo es 1000' })
  monto!: number;

  @IsOptional()
  @IsIn(['COP', 'USD'])
  moneda: string = 'COP';

  @IsOptional()
  @IsBoolean()
  esRecurrente: boolean = false;

  // Mejora sobre el legacy (que no validaba esto): si `esRecurrente` es
  // true, `frecuencia` pasa a ser obligatoria y debe ser un valor válido.
  @ValidateIf((dto: InitDonacionDto) => dto.esRecurrente === true)
  @IsEnum(FrecuenciaDonacion, { message: 'La frecuencia es requerida para donaciones recurrentes' })
  frecuencia?: FrecuenciaDonacion;

  @IsOptional()
  @IsBoolean()
  aparecerMuroDonantes: boolean = false;
}
