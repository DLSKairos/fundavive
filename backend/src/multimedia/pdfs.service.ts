import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { bigIntToNumber } from '../common/utils/bigint.util';
import { CloudinaryService } from '../integrations/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfInformativo } from "@prisma/client";

const PDFS_FOLDER = 'fundavive/pdfs';

export interface PdfInformativoSerializado extends Omit<PdfInformativo, 'tamanoArchivo'> {
  tamanoArchivo: number | null;
}

function serializar(fila: PdfInformativo): PdfInformativoSerializado {
  return { ...fila, tamanoArchivo: bigIntToNumber(fila.tamanoArchivo) };
}

@Injectable()
export class PdfsService {
  private readonly logger = new Logger(PdfsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logActividad: LogActividadService,
  ) {}

  async listAdmin(): Promise<PdfInformativoSerializado[]> {
    const rows = await this.prisma.pdfInformativo.findMany({ orderBy: { subidoEn: 'desc' } });
    return rows.map(serializar);
  }

  async listPublic(): Promise<PdfInformativoSerializado[]> {
    const rows = await this.prisma.pdfInformativo.findMany({
      where: { activo: true },
      orderBy: { subidoEn: 'desc' },
    });
    return rows.map(serializar);
  }

  async upload(
    file: Express.Multer.File,
    titulo: string,
    descripcion: string | undefined,
    adminId: number,
  ): Promise<PdfInformativoSerializado> {
    const uploadResult = await this.cloudinaryService.uploadRaw(file.buffer, PDFS_FOLDER);

    const fila = await this.prisma.pdfInformativo.create({
      data: {
        titulo,
        descripcion: descripcion ?? null,
        nombreArchivo: file.originalname,
        urlPdf: uploadResult.secure_url,
        rutaArchivo: uploadResult.public_id,
        tamanoArchivo: BigInt(file.size),
      },
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'upload_pdf',
      descripcion: `PDF subido: ${titulo}`,
      recursoId: fila.id,
    });

    return serializar(fila);
  }

  async toggle(id: number): Promise<PdfInformativoSerializado> {
    const existente = await this.prisma.pdfInformativo.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('PDF no encontrado');
    }

    const actualizado = await this.prisma.pdfInformativo.update({
      where: { id },
      data: { activo: !existente.activo },
    });

    return serializar(actualizado);
  }

  async remove(id: number, adminId: number): Promise<void> {
    const existente = await this.prisma.pdfInformativo.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('PDF no encontrado');
    }

    await this.cloudinaryService
      .destroy(existente.rutaArchivo, 'raw')
      .catch((error: Error) => this.logger.error('Error eliminando PDF de Cloudinary', error.stack));

    await this.prisma.pdfInformativo.delete({ where: { id } });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'delete_pdf',
      descripcion: `PDF eliminado: ${existente.titulo} (ID: ${id})`,
      recursoId: id,
    });
  }

  /** Solo PDFs activos son descargables/visibles desde el sitio público. */
  async obtenerInfoDescarga(id: number): Promise<{ urlPdf: string; nombreArchivo: string }> {
    const pdf = await this.prisma.pdfInformativo.findUnique({ where: { id } });
    if (!pdf || !pdf.activo) {
      throw new NotFoundException('PDF no encontrado');
    }
    return { urlPdf: pdf.urlPdf, nombreArchivo: pdf.nombreArchivo };
  }

  /** Fire-and-forget: nunca debe bloquear ni fallar la respuesta de descarga. */
  async registrarDescarga(id: number): Promise<void> {
    try {
      await this.prisma.pdfInformativo.update({ where: { id }, data: { descargas: { increment: 1 } } });
    } catch (error) {
      this.logger.error('Error incrementando el contador de descargas del PDF', error as Error);
    }
  }
}
