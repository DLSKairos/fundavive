import { Body, Controller, Delete, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { buildImageFileValidationPipe, IMAGE_MAX_SIZE_BYTES } from '../common/utils/file-validation.util';
import { UpdateNoticiasModalDto } from './dto/update-noticias-modal.dto';
import { NoticiasModalService } from './noticias-modal.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/noticias-modal')
export class NoticiasModalAdminController {
  constructor(private readonly noticiasModalService: NoticiasModalService) {}

  @Get()
  async get() {
    const data = await this.noticiasModalService.getAdmin();
    return { success: true, data };
  }

  @Put()
  async update(@Body() dto: UpdateNoticiasModalDto, @CurrentUser() user: JwtPayload) {
    const data = await this.noticiasModalService.update(dto, user.id);
    return { success: true, data, message: 'Configuración del modal de noticias actualizada exitosamente' };
  }

  @Post('imagen')
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: IMAGE_MAX_SIZE_BYTES } }))
  async uploadImagen(@UploadedFile(buildImageFileValidationPipe()) file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
    const data = await this.noticiasModalService.uploadImagen(file, user.id);
    return { success: true, data, message: 'Imagen del modal de noticias actualizada exitosamente' };
  }

  @Delete('imagen')
  async deleteImagen(@CurrentUser() user: JwtPayload) {
    const data = await this.noticiasModalService.deleteImagen(user.id);
    return { success: true, data, message: 'Imagen del modal de noticias eliminada exitosamente' };
  }
}
