import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { PaginationMeta } from '../common/interfaces/pagination-meta.interface';
import { buildPaginationMeta, normalizePagination } from '../common/utils/pagination.util';
import { EmailService } from '../integrations/email.service';
import { EpaycoService } from '../integrations/epayco.service';
import { PrismaService } from '../prisma/prisma.service';
import { Donacion, EstadoDonacion, Prisma } from "@prisma/client";
import { DonacionFiltersDto } from './dto/donacion-filters.dto';
import { InitDonacionDto } from './dto/init-donacion.dto';
import { ListDonacionesQueryDto } from './dto/list-donaciones-query.dto';

export interface EpaycoWebhookBody {
  x_ref_payco?: string;
  x_transaction_id?: string;
  x_amount?: string;
  x_currency_code?: string;
  x_transaction_state?: string;
  x_extra1?: string;
  x_invoice?: string;
  x_signature?: string;
  [key: string]: unknown;
}

/**
 * `Donacion.monto` es `Prisma.Decimal` (para precisión monetaria); las
 * plantillas de `EmailService` solo necesitan un `number` para formatear e
 * interpolar, de ahí esta conversión explícita en el borde del servicio.
 */
function toDonacionEmailData(donacion: Donacion): Omit<Donacion, 'monto'> & { monto: number } {
  return { ...donacion, monto: Number(donacion.monto) };
}

@Injectable()
export class DonacionesService {
  private readonly logger = new Logger(DonacionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly epaycoService: EpaycoService,
    private readonly emailService: EmailService,
    private readonly logActividad: LogActividadService,
  ) {}

  async initDonation(dto: InitDonacionDto): Promise<Donacion> {
    const donacion = await this.prisma.donacion.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        telefono: dto.telefono ?? null,
        cedula: dto.cedula ?? null,
        monto: new Prisma.Decimal(dto.monto),
        moneda: dto.moneda,
        esRecurrente: dto.esRecurrente,
        frecuencia: dto.esRecurrente ? dto.frecuencia : null,
        aparecerMuroDonantes: dto.aparecerMuroDonantes,
        estado: EstadoDonacion.pendiente,
      },
    });

    const referencia = this.epaycoService.generarReferencia(donacion.id);

    return this.prisma.donacion.update({
      where: { id: donacion.id },
      data: { referenciaEpayco: referencia },
    });
  }

  /**
   * Procesa el webhook de ePayco. SIEMPRE resuelve (nunca lanza): cualquier
   * fallo interno queda registrado en el logger y se responde
   * `{ success: false }`, para que el controller pueda contestar 200 de
   * todas formas (ePayco reintenta agresivamente ante códigos != 200/2xx).
   */
  async handleWebhook(body: EpaycoWebhookBody): Promise<{ success: boolean; message: string }> {
    try {
      const firmaValida = this.epaycoService.verificarFirmaWebhook(body);
      if (!firmaValida) {
        this.logger.warn(`[Webhook] Firma inválida: ${JSON.stringify(body)}`);
        return { success: false, message: 'Firma inválida' };
      }

      const referenciaInterna = body.x_extra1 || body.x_invoice;
      if (!referenciaInterna) {
        return { success: false, message: 'Referencia no encontrada en webhook' };
      }

      const donacion = await this.prisma.donacion.findUnique({ where: { referenciaEpayco: referenciaInterna } });
      if (!donacion) {
        this.logger.warn(`[Webhook] Donación no encontrada para referencia: ${referenciaInterna}`);
        return { success: false, message: 'Donación no encontrada' };
      }

      const nuevoEstado = this.epaycoService.mapearEstado(body.x_transaction_state);

      const actualizada = await this.prisma.donacion.update({
        where: { referenciaEpayco: referenciaInterna },
        data: {
          estado: nuevoEstado,
          refPayco: body.x_ref_payco ?? null,
          transactionId: body.x_transaction_id ?? null,
          fechaPago: new Date(),
        },
      });

      if (nuevoEstado === EstadoDonacion.completada && !donacion.comprobanteEnviado) {
        this.emailService
          .sendDonationReceipt(toDonacionEmailData(actualizada))
          .then(async () => {
            await this.prisma.donacion.update({
              where: { referenciaEpayco: referenciaInterna },
              data: { comprobanteEnviado: true },
            });
            await this.emailService
              .sendAdminNotification('donation', toDonacionEmailData(actualizada))
              .catch((error: Error) => this.logger.error('Error notificando al admin de donación completada', error.stack));
          })
          .catch((error: Error) => this.logger.error('Error enviando comprobante de donación', error.stack));
      }

      return { success: true, message: 'Webhook procesado' };
    } catch (error) {
      this.logger.error('[Webhook] Error procesando webhook', (error as Error).stack);
      return { success: false, message: 'Error interno procesando webhook' };
    }
  }

  async getStatusByReferencia(referencia: string): Promise<Donacion> {
    const donacion = await this.prisma.donacion.findUnique({ where: { referenciaEpayco: referencia } });
    if (!donacion) {
      throw new NotFoundException('Donación no encontrada');
    }
    return donacion;
  }

  private buildWhere(filters: DonacionFiltersDto, search?: string): Prisma.DonacionWhereInput {
    const where: Prisma.DonacionWhereInput = {};

    if (filters.estado) where.estado = filters.estado;
    if (filters.esRecurrente !== undefined) where.esRecurrente = filters.esRecurrente;

    if (filters.fechaDesde || filters.fechaHasta) {
      where.creadoEn = {
        ...(filters.fechaDesde ? { gte: new Date(filters.fechaDesde) } : {}),
        ...(filters.fechaHasta ? { lte: new Date(filters.fechaHasta) } : {}),
      };
    }

    if (filters.montoMin !== undefined || filters.montoMax !== undefined) {
      where.monto = {
        ...(filters.montoMin !== undefined ? { gte: new Prisma.Decimal(filters.montoMin) } : {}),
        ...(filters.montoMax !== undefined ? { lte: new Prisma.Decimal(filters.montoMax) } : {}),
      };
    }

    if (search) {
      where.OR = [
        { nombreCompleto: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { referenciaEpayco: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  async list(query: ListDonacionesQueryDto): Promise<{ data: Donacion[]; meta: PaginationMeta }> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);
    const where = this.buildWhere(query, query.search);

    const [rows, total] = await Promise.all([
      this.prisma.donacion.findMany({ where, orderBy: { creadoEn: 'desc' }, skip, take: limit }),
      this.prisma.donacion.count({ where }),
    ]);

    return { data: rows, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: number): Promise<Donacion> {
    const donacion = await this.prisma.donacion.findUnique({ where: { id } });
    if (!donacion) {
      throw new NotFoundException('Donación no encontrada');
    }
    return donacion;
  }

  async resendReceipt(id: number, adminId: number): Promise<void> {
    const donacion = await this.prisma.donacion.findUnique({ where: { id } });
    if (!donacion) {
      throw new NotFoundException('Donación no encontrada');
    }
    if (donacion.estado !== EstadoDonacion.completada) {
      throw new BadRequestException('Solo se puede reenviar el comprobante de donaciones completadas');
    }

    await this.emailService.sendDonationReceipt(toDonacionEmailData(donacion));

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'resend_receipt',
      descripcion: `Comprobante reenviado para donación ${donacion.referenciaEpayco}`,
      recursoId: id,
    });
  }

  async findForExport(filters: DonacionFiltersDto): Promise<Donacion[]> {
    const where = this.buildWhere(filters);
    return this.prisma.donacion.findMany({ where, orderBy: { creadoEn: 'desc' } });
  }
}
