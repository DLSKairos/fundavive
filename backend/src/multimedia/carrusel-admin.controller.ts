import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { buildImageFileValidationPipe, IMAGE_MAX_SIZE_BYTES } from '../common/utils/file-validation.util';
import { CarruselService } from './carrusel.service';
import { ReorderCarruselDto } from './dto/reorder-carrusel.dto';

const MAX_IMAGENES_POR_SUBIDA = 10;

@UseGuards(JwtAuthGuard)
@Controller('admin/carousel/images')
export class CarruselAdminController {
  constructor(private readonly carruselService: CarruselService) {}

  @Get()
  async list() {
    const data = await this.carruselService.listAdmin();
    return { success: true, data };
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', MAX_IMAGENES_POR_SUBIDA, {
      storage: memoryStorage(),
      limits: { fileSize: IMAGE_MAX_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFiles(buildImageFileValidationPipe()) files: Express.Multer.File[],
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.carruselService.uploadImages(files, user.id);
    return { success: true, data, message: 'Imágenes subidas exitosamente' };
  }

  @Put('reorder')
  async reorder(@Body() dto: ReorderCarruselDto) {
    await this.carruselService.reorder(dto.orden);
    return { success: true, message: 'Orden del carrusel actualizado exitosamente' };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id', ParseIntPipe) id: number) {
    const data = await this.carruselService.toggle(id);
    return { success: true, data, message: 'Estado de la imagen actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.carruselService.remove(id, user.id);
    return { success: true, message: 'Imagen de carrusel eliminada exitosamente' };
  }
}
