import { Controller, Delete, Get, Param, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { buildImageFileValidationPipe, IMAGE_MAX_SIZE_BYTES } from '../common/utils/file-validation.util';
import { SeccionesImagenesService } from './secciones-imagenes.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/secciones-imagenes')
export class SeccionesImagenesAdminController {
  constructor(private readonly seccionesImagenesService: SeccionesImagenesService) {}

  @Get()
  async list() {
    const data = await this.seccionesImagenesService.getAdmin();
    return { success: true, data };
  }

  @Put(':pagina/:clave')
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage(), limits: { fileSize: IMAGE_MAX_SIZE_BYTES } }))
  async updateImagen(
    @Param('pagina') pagina: string,
    @Param('clave') clave: string,
    @UploadedFile(buildImageFileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.seccionesImagenesService.updateImagen(pagina, clave, file, user.id);
    return { success: true, data, message: 'Imagen de sección actualizada exitosamente' };
  }

  @Delete(':pagina/:clave')
  async resetImagen(@Param('pagina') pagina: string, @Param('clave') clave: string, @CurrentUser() user: JwtPayload) {
    const data = await this.seccionesImagenesService.resetImagen(pagina, clave, user.id);
    return { success: true, data, message: 'Imagen de sección restablecida exitosamente' };
  }
}
