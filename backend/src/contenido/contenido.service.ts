import { Injectable } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContenidoPagina } from "@prisma/client";
import { UpdateSeccionItemDto } from './dto/update-seccion-item.dto';
import { normalizarPaginaCms } from './pagina-cms.util';
import { sanitizarContenidoHtml } from './sanitizar-contenido.util';

export interface PaginaResumen {
  pagina: string;
  totalSecciones: number;
  ultimaActualizacion: Date | null;
}

@Injectable()
export class ContenidoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logActividad: LogActividadService,
  ) {}

  /** Público: solo secciones activas, ordenadas. */
  async getPublicByPagina(paginaParam: string): Promise<ContenidoPagina[]> {
    const pagina = normalizarPaginaCms(paginaParam);
    return this.prisma.contenidoPagina.findMany({
      where: { pagina, activo: true },
      orderBy: { orden: 'asc' },
    });
  }

  /** Admin: resumen agrupado por página. */
  async listAdminGrouped(): Promise<PaginaResumen[]> {
    const grouped = await this.prisma.contenidoPagina.groupBy({
      by: ['pagina'],
      _count: { _all: true },
      _max: { actualizadoEn: true },
    });

    return grouped.map((g) => ({
      pagina: g.pagina,
      totalSecciones: g._count._all,
      ultimaActualizacion: g._max.actualizadoEn,
    }));
  }

  /** Admin: todas las secciones (activas e inactivas) de una página. */
  async getAdminByPagina(paginaParam: string): Promise<ContenidoPagina[]> {
    const pagina = normalizarPaginaCms(paginaParam);
    return this.prisma.contenidoPagina.findMany({
      where: { pagina },
      orderBy: { orden: 'asc' },
    });
  }

  /**
   * Reemplaza el set de secciones de una página en una única transacción:
   * borra las secciones existentes que ya no vengan en el array y hace
   * upsert del resto, sanitizando el HTML de `contenido`.
   */
  async updatePagina(
    paginaParam: string,
    secciones: UpdateSeccionItemDto[],
    adminId: number,
  ): Promise<ContenidoPagina[]> {
    const pagina = normalizarPaginaCms(paginaParam);
    const nombresEnviados = secciones.map((s) => s.seccion);

    const actualizado = await this.prisma.$transaction(async (tx) => {
      await tx.contenidoPagina.deleteMany({
        where: { pagina, seccion: { notIn: nombresEnviados } },
      });

      const resultados: ContenidoPagina[] = [];
      for (const item of secciones) {
        const contenidoSanitizado =
          item.contenido != null && item.contenido !== '' ? sanitizarContenidoHtml(item.contenido) : null;

        const fila = await tx.contenidoPagina.upsert({
          where: { pagina_seccion: { pagina, seccion: item.seccion } },
          create: {
            pagina,
            seccion: item.seccion,
            contenido: contenidoSanitizado,
            orden: item.orden,
            icono: item.icono ?? null,
            activo: item.activo,
            actualizadoPor: adminId,
          },
          update: {
            contenido: contenidoSanitizado,
            orden: item.orden,
            icono: item.icono ?? null,
            activo: item.activo,
            actualizadoPor: adminId,
          },
        });
        resultados.push(fila);
      }

      return resultados;
    });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_page',
      descripcion: `Contenido actualizado para la página '${pagina}' (${secciones.length} secciones)`,
      recursoId: actualizado[0]?.id ?? null,
    });

    return actualizado;
  }
}
