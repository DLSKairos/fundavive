import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { bigIntToNumber } from '../common/utils/bigint.util';
import { CloudinaryService } from '../integrations/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { ImagenCarrusel } from "@prisma/client";
import { OrdenCarruselItemDto } from './dto/reorder-carrusel.dto';

const CAROUSEL_FOLDER = 'fundavive/carousel';

export interface ImagenCarruselSerializada extends Omit<ImagenCarrusel, 'tamanoArchivo'> {
  tamanoArchivo: number | null;
}

function serializar(fila: ImagenCarrusel): ImagenCarruselSerializada {
  return { ...fila, tamanoArchivo: bigIntToNumber(fila.tamanoArchivo) };
}

@Injectable()
export class CarruselService {
  private readonly logger = new Logger(CarruselService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logActividad: LogActividadService,
  ) {}

  async listAdmin(): Promise<ImagenCarruselSerializada[]> {
    const rows = await this.prisma.imagenCarrusel.findMany({ orderBy: { orden: 'asc' } });
    return rows.map(serializar);
  }

  async listPublic(): Promise<ImagenCarruselSerializada[]> {
    const rows = await this.prisma.imagenCarrusel.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    });
    return rows.map(serializar);
  }

  async uploadImages(files: Express.Multer.File[], adminId: number): Promise<ImagenCarruselSerializada[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Debe subir al menos una imagen');
    }

    const maxActual = await this.prisma.imagenCarrusel.aggregate({ _max: { orden: true } });
    let siguienteOrden = (maxActual._max.orden ?? 0) + 1;

    const creadas: ImagenCarrusel[] = [];
    for (const file of files) {
      const uploadResult = await this.cloudinaryService.uploadImage(file.buffer, CAROUSEL_FOLDER);

      const fila = await this.prisma.imagenCarrusel.create({
        data: {
          nombreArchivo: file.originalname,
          urlImagen: uploadResult.secure_url,
          rutaArchivo: uploadResult.public_id,
          tamanoArchivo: BigInt(file.size),
          ancho: uploadResult.width ?? null,
          alto: uploadResult.height ?? null,
          orden: siguienteOrden,
        },
      });

      creadas.push(fila);
      siguienteOrden += 1;
    }

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'upload_carousel',
      descripcion: `${creadas.length} imagen(es) subida(s) al carrusel`,
    });

    return creadas.map(serializar);
  }

  async reorder(orden: OrdenCarruselItemDto[]): Promise<void> {
    await this.prisma.$transaction(
      orden.map((item) => this.prisma.imagenCarrusel.update({ where: { id: item.id }, data: { orden: item.orden } })),
    );
  }

  async toggle(id: number): Promise<ImagenCarruselSerializada> {
    const existente = await this.prisma.imagenCarrusel.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('Imagen de carrusel no encontrada');
    }

    const actualizado = await this.prisma.imagenCarrusel.update({
      where: { id },
      data: { activo: !existente.activo },
    });

    return serializar(actualizado);
  }

  async remove(id: number, adminId: number): Promise<void> {
    const existente = await this.prisma.imagenCarrusel.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('Imagen de carrusel no encontrada');
    }

    await this.cloudinaryService
      .destroy(existente.rutaArchivo, 'image')
      .catch((error: Error) => this.logger.error('Error eliminando imagen de carrusel de Cloudinary', error.stack));

    await this.prisma.imagenCarrusel.delete({ where: { id } });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'delete_carousel',
      descripcion: `Imagen de carrusel eliminada (ID: ${id})`,
      recursoId: id,
    });
  }
}
