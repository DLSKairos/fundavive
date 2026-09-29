import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoDonacion, EstadoVoluntario } from "@prisma/client";

const MS_POR_DIA = 24 * 60 * 60 * 1000;
// Ventana de "recientes" compartida por voluntarios y donaciones en el
// resumen del dashboard.
const DIAS_VENTANA_30 = 30;
const DIAS_VENTANA_CONTACTOS = 7;

interface DonacionMesRaw {
  mes: Date;
  cantidad: bigint | number | string;
  total: string | number | null;
}

export interface DonacionesPorMes {
  mes: string;
  cantidad: number;
  total: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const hace30Dias = new Date(Date.now() - DIAS_VENTANA_30 * MS_POR_DIA);
    const hace7Dias = new Date(Date.now() - DIAS_VENTANA_CONTACTOS * MS_POR_DIA);

    const [
      totalVoluntarios,
      voluntariosPorEstado,
      voluntariosUltimos30Dias,
      totalDonaciones,
      donacionesCompletadas,
      donacionesPendientes,
      recaudadoTotalAgg,
      recaudadoUltimos30DiasAgg,
      totalContactos,
      contactosNoLeidos,
      contactosUltimos7Dias,
      carruselActivoCount,
      pdfsActivosCount,
      pdfsDescargasAgg,
    ] = await Promise.all([
      this.prisma.voluntario.count(),
      this.prisma.voluntario.groupBy({ by: ['estado'], _count: { _all: true } }),
      this.prisma.voluntario.count({ where: { creadoEn: { gte: hace30Dias } } }),
      this.prisma.donacion.count(),
      this.prisma.donacion.count({ where: { estado: EstadoDonacion.completada } }),
      this.prisma.donacion.count({ where: { estado: EstadoDonacion.pendiente } }),
      this.prisma.donacion.aggregate({ _sum: { monto: true }, where: { estado: EstadoDonacion.completada } }),
      this.prisma.donacion.aggregate({
        _sum: { monto: true },
        where: { estado: EstadoDonacion.completada, creadoEn: { gte: hace30Dias } },
      }),
      this.prisma.formularioContacto.count(),
      this.prisma.formularioContacto.count({ where: { leido: false } }),
      this.prisma.formularioContacto.count({ where: { creadoEn: { gte: hace7Dias } } }),
      this.prisma.imagenCarrusel.count({ where: { activo: true } }),
      this.prisma.pdfInformativo.count({ where: { activo: true } }),
      this.prisma.pdfInformativo.aggregate({ _sum: { descargas: true } }),
    ]);

    const porEstado = Object.fromEntries(Object.values(EstadoVoluntario).map((estado) => [estado, 0])) as Record<
      EstadoVoluntario,
      number
    >;
    for (const grupo of voluntariosPorEstado) {
      porEstado[grupo.estado] = grupo._count._all;
    }

    return {
      voluntarios: {
        total: totalVoluntarios,
        porEstado,
        ultimos30Dias: voluntariosUltimos30Dias,
      },
      donaciones: {
        total: totalDonaciones,
        completadas: donacionesCompletadas,
        pendientes: donacionesPendientes,
        totalRecaudado: Number(recaudadoTotalAgg._sum.monto ?? 0),
        recaudadoUltimos30Dias: Number(recaudadoUltimos30DiasAgg._sum.monto ?? 0),
      },
      contactos: {
        total: totalContactos,
        noLeidos: contactosNoLeidos,
        ultimos7Dias: contactosUltimos7Dias,
      },
      carrusel: {
        activo: carruselActivoCount,
      },
      pdfs: {
        activos: pdfsActivosCount,
        totalDescargas: pdfsDescargasAgg._sum.descargas ?? 0,
      },
    };
  }

  /**
   * Agrupa donaciones `completada` por mes (de `fechaPago`, o `creadoEn` si
   * `fechaPago` es null). Se usa `$queryRaw` (SQL parametrizado, tagged
   * template): el agrupamiento por mes con backfill de meses sin donaciones
   * es más simple y legible en SQL crudo que reconstruido a mano en JS.
   */
  async getDonationsChart(months: number): Promise<DonacionesPorMes[]> {
    const filas = await this.prisma.$queryRaw<DonacionMesRaw[]>`
      SELECT
        date_trunc('month', COALESCE(fecha_pago, creado_en)) AS mes,
        COUNT(*)::bigint AS cantidad,
        COALESCE(SUM(monto), 0)::numeric::text AS total
      FROM donaciones
      WHERE estado = 'completada'::estado_donacion
        AND COALESCE(fecha_pago, creado_en) >= (date_trunc('month', now()) - make_interval(months => ${months - 1}))
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return filas.map((fila) => ({
      mes: fila.mes.toISOString().slice(0, 7),
      cantidad: Number(fila.cantidad),
      total: Number(fila.total ?? 0),
    }));
  }
}
