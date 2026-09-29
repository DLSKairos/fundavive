import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { CloudinaryService } from '../integrations/cloudinary.service';
import { bigIntToNumber } from '../common/utils/bigint.util';
import { PrismaService } from '../prisma/prisma.service';
import { ImagenSeccion } from "@prisma/client";

const SECCIONES_IMAGENES_FOLDER = 'fundavive/secciones';

export interface ImagenSeccionPublica {
  pagina: string;
  clave: string;
  urlImagen: string;
}

export interface ImagenSeccionSerializada extends Omit<ImagenSeccion, 'tamanoArchivo'> {
  tamanoArchivo: number | null;
}

function serializar(fila: ImagenSeccion): ImagenSeccionSerializada {
  return { ...fila, tamanoArchivo: bigIntToNumber(fila.tamanoArchivo) };
}

@Injectable()
export class SeccionesImagenesService {
  private readonly logger = new Logger(SeccionesImagenesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logActividad: LogActividadService,
  ) {}

  /** Público: solo los slots que ya tienen imagen asignada. */
  async getPublic(): Promise<ImagenSeccionPublica[]> {
    const rows = await this.prisma.imagenSeccion.findMany({
      where: { urlImagen: { not: null } },
    });
    return rows.map((r) => ({ pagina: r.pagina, clave: r.clave, urlImagen: r.urlImagen as string }));
  }

  /** Admin: los 8 slots fijos, con o sin imagen. */
  async getAdmin(): Promise<ImagenSeccionSerializada[]> {
    const rows = await this.prisma.imagenSeccion.findMany({ orderBy: [{ pagina: 'asc' }, { clave: 'asc' }] });
    return rows.map(serializar);
  }

  private async findSlotOrThrow(pagina: string, clave: string): Promise<ImagenSeccion> {
    const slot = await this.prisma.imagenSeccion.findUnique({ where: { pagina_clave: { pagina, clave } } });
    if (!slot) {
      throw new NotFoundException(`No existe el slot de imagen '${pagina}/${clave}'`);
    }
    return slot;
  }

  /** Nunca crea slots nuevos: solo actualiza la imagen de un slot existente. */
  async updateImagen(
    pagina: string,
    clave: string,
    file: Express.Multer.File,
    adminId: number,
  ): Promise<ImagenSeccionSerializada> {
    const slot = await this.findSlotOrThrow(pagina, clave);

    if (slot.rutaArchivo) {
      await this.cloudinaryService
        .destroy(slot.rutaArchivo, 'image')
        .catch((error: Error) => this.logger.error('Error eliminando imagen previa de sección', error.stack));
    }

    const uploadResult = await this.cloudinaryService.uploadImage(file.buffer, SECCIONES_IMAGENES_FOLDER);

    const actualizado = await this.prisma.imagenSeccion.update({
      where: { pagina_clave: { pagina, clave } },
      data: {
        nombreArchivo: file.originalname,
        urlImagen: uploadResult.secure_url,
        rutaArchivo: uploadResult.public_id,
        tamanoArchivo: BigInt(file.size),
      },
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_section_image',
      descripcion: `Imagen actualizada para la sección '${pagina}/${clave}'`,
      recursoId: actualizado.id,
    });

    return serializar(actualizado);
  }

  async resetImagen(pagina: string, clave: string, adminId: number): Promise<ImagenSeccionSerializada> {
    const slot = await this.findSlotOrThrow(pagina, clave);

    if (slot.rutaArchivo) {
      await this.cloudinaryService
        .destroy(slot.rutaArchivo, 'image')
        .catch((error: Error) => this.logger.error('Error eliminando imagen de sección', error.stack));
    }

    const actualizado = await this.prisma.imagenSeccion.update({
      where: { pagina_clave: { pagina, clave } },
      data: { nombreArchivo: null, urlImagen: null, rutaArchivo: null, tamanoArchivo: null },
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'reset_section_image',
      descripcion: `Imagen restablecida para la sección '${pagina}/${clave}'`,
      recursoId: actualizado.id,
    });

    return serializar(actualizado);
  }
}
