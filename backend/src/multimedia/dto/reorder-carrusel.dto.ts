import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, ValidateNested } from 'class-validator';

export class OrdenCarruselItemDto {
  @IsInt()
  id!: number;

  @IsInt()
  orden!: number;
}

export class ReorderCarruselDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrdenCarruselItemDto)
  orden!: OrdenCarruselItemDto[];
}
