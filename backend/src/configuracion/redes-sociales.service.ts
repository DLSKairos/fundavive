import { BadRequestException, Injectable } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { PrismaService } from '../prisma/prisma.service';

export type RedesSocialesMap = Record<string, { url: string | null; activo: boolean }>;

interface RedSocialInputValidado {
  plataforma: string;
  url: string | null;
  activo: boolean;
}

@Injectable()
export class RedesSocialesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logActividad: LogActividadService,
  ) {}

  /** Usado tanto por el endpoint público como por el admin (mismo mapa, sin filtrar). */
  async getMap(): Promise<RedesSocialesMap> {
    const rows = await this.prisma.configuracionRedSocial.findMany();
    return rows.reduce<RedesSocialesMap>((acc, row) => {
      acc[row.plataforma] = { url: row.url, activo: row.activo };
      return acc;
    }, {});
  }

  /**
   * Body de cardinalidad libre: `{ [plataforma]: { url?, activo } }`. Se
   * valida manualmente (no con class-validator: la cantidad de claves no es
   * fija) y se hace upsert de cada plataforma dentro de una transacción.
   */
  private validarBody(body: unknown): RedSocialInputValidado[] {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      throw new BadRequestException('El cuerpo debe ser un objeto { plataforma: { url, activo } }');
    }

    const entradas = Object.entries(body as Record<string, unknown>);
    if (entradas.length === 0) {
      throw new BadRequestException('Debe enviar al menos una plataforma');
    }

    return entradas.map(([plataforma, valor]) => {
      if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) {
        throw new BadRequestException(`La configuración de '${plataforma}' debe ser un objeto { url, activo }`);
      }

      const { url, activo } = valor as { url?: unknown; activo?: unknown };

      if (url !== undefined && url !== null && typeof url !== 'string') {
        throw new BadRequestException(`'url' debe ser texto para la plataforma '${plataforma}'`);
      }
      if (typeof activo !== 'boolean') {
        throw new BadRequestException(`'activo' es requerido (boolean) para la plataforma '${plataforma}'`);
      }

      return { plataforma, url: (url as string | undefined) ?? null, activo };
    });
  }

  async update(body: unknown, adminId: number): Promise<RedesSocialesMap> {
    const datos = this.validarBody(body);

    await this.prisma.$transaction(
      datos.map(({ plataforma, url, activo }) =>
        this.prisma.configuracionRedSocial.upsert({
          where: { plataforma },
          create: { plataforma, url, activo },
          update: { url, activo },
        }),
      ),
    );

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_social',
      descripcion: `Redes sociales actualizadas: ${datos.map((d) => d.plataforma).join(', ')}`,
    });

    return this.getMap();
  }
}
