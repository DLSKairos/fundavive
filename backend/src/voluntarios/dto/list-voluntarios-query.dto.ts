import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { EstadoVoluntario } from "@prisma/client";

export class ListVoluntariosQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(EstadoVoluntario)
  estado?: EstadoVoluntario;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
