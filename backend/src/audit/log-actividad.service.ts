import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RegistrarLogInput {
  usuarioId?: number | null;
  accion: string;
  descripcion?: string | null;
  ipAddress?: string | null;
  recursoId?: number | null;
}

/**
 * Servicio de auditoría: inserta filas en `logs_actividad_admin`.
 * `registrar` nunca debe lanzar ni bloquear al caller: atrapa sus propios
 * errores y solo los deja en el logger. Se invoca siempre en modo
 * fire-and-forget desde los servicios de negocio (login, cambios de estado,
 * borrados, reenvíos de comprobante, etc.).
 */
@Injectable()
export class LogActividadService {
  private readonly logger = new Logger(LogActividadService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(input: RegistrarLogInput): Promise<void> {
    try {
      await this.prisma.logActividadAdmin.create({
        data: {
          usuarioId: input.usuarioId ?? null,
          accion: input.accion,
          descripcion: input.descripcion ?? null,
          ipAddress: input.ipAddress ?? null,
          recursoId: input.recursoId ?? null,
        },
      });
    } catch (error) {
      this.logger.error(`No se pudo registrar el log de actividad '${input.accion}'`, error as Error);
    }
  }
}
