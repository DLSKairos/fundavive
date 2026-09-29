import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { CloudinaryService } from '../integrations/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfiguracionModalNoticia } from "@prisma/client";
import { UpdateNoticiasModalDto } from './dto/update-noticias-modal.dto';

const NEWS_MODAL_IMAGE_FOLDER = 'fundavive/news-modal';

/**
 * Singleton: la tabla `configuracion_modal_noticia` siempre opera sobre la
 * fila `id = 1` (convención documentada en `schema.prisma`).
 */
const NOTICIAS_MODAL_ID = 1;

@Injectable()
export class NoticiasModalService {
  private readonly logger = new Logger(NoticiasModalService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logActividad: LogActividadService,
  ) {}

  /** Público: `null` si no hay fila o si `activo = false`. */
  async getPublic(): Promise<ConfiguracionModalNoticia | null> {
    const config = await this.prisma.configuracionModalNoticia.findUnique({ where: { id: NOTICIAS_MODAL_ID } });
    if (!config || !config.activo) return null;
    return config;
  }

  /** Admin: config completa sin filtrar por `activo`; `null` si no existe. */
  async getAdmin(): Promise<ConfiguracionModalNoticia | null> {
    return this.prisma.configuracionModalNoticia.findUnique({ where: { id: NOTICIAS_MODAL_ID } });
  }

  async update(dto: UpdateNoticiasModalDto, adminId: number): Promise<ConfiguracionModalNoticia> {
    const data = {
      titulo: dto.titulo,
      subtitulo: dto.subtitulo,
      urlDestino: dto.urlDestino,
      etiquetaBoton: dto.etiquetaBoton,
      badgeTexto: dto.badgeTexto ?? 'Noticia destacada',
      highlightTexto: dto.highlightTexto ?? null,
      activo: dto.activo ?? true,
    };

    const actualizado = await this.prisma.configuracionModalNoticia.upsert({
      where: { id: NOTICIAS_MODAL_ID },
      create: { id: NOTICIAS_MODAL_ID, ...data },
      update: data,
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_news_modal',
      descripcion: 'Configuración del modal de noticias actualizada',
      recursoId: actualizado.id,
    });

    return actualizado;
  }

  async uploadImagen(file: Express.Multer.File, adminId: number): Promise<ConfiguracionModalNoticia> {
    const existente = await this.prisma.configuracionModalNoticia.findUnique({ where: { id: NOTICIAS_MODAL_ID } });
    if (!existente) {
      throw new BadRequestException(
        'Debe guardar la configuración del modal de noticias antes de subir una imagen',
      );
    }

    if (existente.imagenPublicId) {
      await this.cloudinaryService
        .destroy(existente.imagenPublicId, 'image')
        .catch((error: Error) => this.logger.error('Error eliminando imagen previa del modal de noticias', error.stack));
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file.buffer, NEWS_MODAL_IMAGE_FOLDER);

    const actualizado = await this.prisma.configuracionModalNoticia.update({
      where: { id: NOTICIAS_MODAL_ID },
      data: { imagenUrl: uploadResult.secure_url, imagenPublicId: uploadResult.public_id },
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_news_modal_image',
      descripcion: 'Imagen del modal de noticias actualizada',
      recursoId: actualizado.id,
    });

    return actualizado;
  }

  async deleteImagen(adminId: number): Promise<ConfiguracionModalNoticia> {
    const existente = await this.prisma.configuracionModalNoticia.findUnique({ where: { id: NOTICIAS_MODAL_ID } });
    if (!existente) {
      throw new NotFoundException('Configuración del modal de noticias no encontrada');
    }

    if (existente.imagenPublicId) {
      await this.cloudinaryService
        .destroy(existente.imagenPublicId, 'image')
        .catch((error: Error) => this.logger.error('Error eliminando imagen del modal de noticias', error.stack));
    }

    const actualizado = await this.prisma.configuracionModalNoticia.update({
      where: { id: NOTICIAS_MODAL_ID },
      data: { imagenUrl: null, imagenPublicId: null },
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'delete_news_modal_image',
      descripcion: 'Imagen del modal de noticias eliminada',
      recursoId: actualizado.id,
    });

    return actualizado;
  }
}
