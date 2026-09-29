import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { UpdateSeccionItemDto } from './update-seccion-item.dto';

export class UpdatePaginaContenidoDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateSeccionItemDto)
  secciones!: UpdateSeccionItemDto[];
}
