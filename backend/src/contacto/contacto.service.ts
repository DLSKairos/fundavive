import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { PaginationMeta } from '../common/interfaces/pagination-meta.interface';
import { buildPaginationMeta, normalizePagination } from '../common/utils/pagination.util';
import { EmailService } from '../integrations/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { FormularioContacto, Prisma } from "@prisma/client";
import { CreateContactoDto } from './dto/create-contacto.dto';
import { ListContactoQueryDto } from './dto/list-contacto-query.dto';

@Injectable()
export class ContactoService {
  private readonly logger = new Logger(ContactoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly logActividad: LogActividadService,
  ) {}

  async create(dto: CreateContactoDto): Promise<FormularioContacto> {
    const contacto = await this.prisma.formularioContacto.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        email: dto.email,
        telefono: dto.telefono ?? null,
        asunto: dto.asunto,
        mensaje: dto.mensaje,
      },
    });

    this.emailService
      .sendContactConfirmation(contacto)
      .catch((error: Error) => this.logger.error('Error enviando confirmación de contacto', error.stack));
    this.emailService
      .sendAdminNotification('contact', contacto)
      .catch((error: Error) => this.logger.error('Error notificando al admin de nuevo mensaje de contacto', error.stack));

    return contacto;
  }

  async list(query: ListContactoQueryDto): Promise<{ data: FormularioContacto[]; meta: PaginationMeta }> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const where: Prisma.FormularioContactoWhereInput = {};

    if (query.leido !== undefined) where.leido = query.leido;

    if (query.search) {
      where.OR = [
        { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { asunto: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {
        ...(query.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
        ...(query.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.formularioContacto.findMany({ where, orderBy: { creadoEn: 'desc' }, skip, take: limit }),
      this.prisma.formularioContacto.count({ where }),
    ]);

    return { data: rows, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: number): Promise<FormularioContacto> {
    const contacto = await this.prisma.formularioContacto.findUnique({ where: { id } });
    if (!contacto) {
      throw new NotFoundException('Mensaje de contacto no encontrado');
    }
    return contacto;
  }

  /** Idempotente: si ya estaba `leido = true`, no falla ni cambia nada más. */
  async markAsRead(id: number, adminId: number): Promise<FormularioContacto> {
    const existente = await this.prisma.formularioContacto.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('Mensaje de contacto no encontrado');
    }

    const actualizado = existente.leido
      ? existente
      : await this.prisma.formularioContacto.update({ where: { id }, data: { leido: true } });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_contact_read',
      descripcion: `Mensaje de contacto ID ${id} marcado como leído`,
      recursoId: id,
    });

    return actualizado;
  }

  async remove(id: number): Promise<void> {
    const existente = await this.prisma.formularioContacto.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('Mensaje de contacto no encontrado');
    }
    await this.prisma.formularioContacto.delete({ where: { id } });
  }
}
