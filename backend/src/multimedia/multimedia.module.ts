import { Module } from '@nestjs/common';
import { CarruselAdminController } from './carrusel-admin.controller';
import { CarruselService } from './carrusel.service';
import { HomeController } from './home.controller';
import { PdfsAdminController } from './pdfs-admin.controller';
import { PdfsService } from './pdfs.service';

/**
 * Agrupa carrusel de imágenes y PDFs informativos (media pública del home):
 * comparten controller público (`HomeController`) y el mismo criterio de
 * subida/borrado contra Cloudinary, por eso se mantienen en un solo módulo
 * en vez de `CarruselModule`/`PdfsModule` separados.
 */
@Module({
  controllers: [CarruselAdminController, PdfsAdminController, HomeController],
  providers: [CarruselService, PdfsService],
})
export class MultimediaModule {}
