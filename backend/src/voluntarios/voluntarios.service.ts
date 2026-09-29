import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../integrations/cloudinary.service';
import { EmailService } from '../integrations/email.service';
import { LogActividadService } from '../audit/log-actividad.service';
import { PrismaService } from '../prisma/prisma.service';
import { calcularEdad } from '../common/utils/calcular-edad.util';
import { buildPaginationMeta, normalizePagination } from '../common/utils/pagination.util';
import { PaginationMeta } from '../common/interfaces/pagination-meta.interface';
import { Prisma, Voluntario } from "@prisma/client";
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { ListVoluntariosQueryDto } from './dto/list-voluntarios-query.dto';
import { UpdateEstadoVoluntarioDto } from './dto/update-estado-voluntario.dto';

const CV_FOLDER = 'fundavive/cvs';

export interface VoluntarioConEdad extends Voluntario {
  edad: number | null;
}

@Injectable()
export class VoluntariosService {
  private readonly logger = new Logger(VoluntariosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly emailService: EmailService,
    private readonly logActividad: LogActividadService,
  ) {}

  async create(dto: CreateVoluntarioDto): Promise<Voluntario> {
    const [existingEmail, existingCedula] = await Promise.all([
      this.prisma.voluntario.findUnique({ where: { email: dto.email } }),
      this.prisma.voluntario.findUnique({ where: { cedula: dto.cedula } }),
    ]);

    if (existingEmail) {
      throw new ConflictException('Este email ya está registrado como voluntario');
    }
    if (existingCedula) {
      throw new ConflictException('Esta cédula ya está registrada');
    }

    const voluntario = await this.prisma.voluntario.create({
      data: {
        nombreCompleto: dto.nombreCompleto,
        cedula: dto.cedula,
        email: dto.email,
        telefono: dto.telefono,
        ciudad: dto.ciudad,
        direccion: dto.direccion ?? null,
        fechaNacimiento: dto.fechaNacimiento ? new Date(dto.fechaNacimiento) : null,
        nivelEstudios: dto.nivelEstudios ?? null,
        profesionOcupacion: dto.profesionOcupacion ?? null,
        habilidadesEspeciales: dto.habilidadesEspeciales ?? null,
        disponibilidadHoraria: dto.disponibilidadHoraria ?? null,
        motivacion: dto.motivacion ?? null,
        areasInteres: dto.areasInteres ?? Prisma.JsonNull,
      },
    });

    // Side-effects fire-and-forget: no deben bloquear la respuesta 201.
    this.emailService
      .sendVolunteerConfirmation(voluntario)
      .catch((error: Error) => this.logger.error('Error enviando confirmación al voluntario', error.stack));
    this.emailService
      .sendAdminNotification('volunteer', voluntario)
      .catch((error: Error) => this.logger.error('Error notificando al admin de nuevo voluntario', error.stack));

    return voluntario;
  }

  async uploadCv(
    id: number,
    file: Express.Multer.File,
  ): Promise<{ nombreArchivo: string; url: string; tamano: number }> {
    const voluntario = await this.prisma.voluntario.findUnique({ where: { id } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    const uploadResult = await this.cloudinaryService.uploadRaw(file.buffer, CV_FOLDER);

    const updated = await this.prisma.voluntario.update({
      where: { id },
      data: {
        nombreArchivoCv: file.originalname,
        rutaArchivoCv: uploadResult.public_id,
        urlCv: uploadResult.secure_url,
      },
    });

    // IMPORTANTE: se adjunta directamente el buffer que ya está en memoria
    // (del propio upload), sin volver a descargarlo desde Cloudinary, para
    // corregir el bug del legacy que adjuntaba por `path` de una URL remota.
    this.emailService
      .sendVolunteerApplicationSummary(updated, file.buffer, file.originalname)
      .catch((error: Error) => this.logger.error('Error enviando resumen de postulación', error.stack));

    return {
      nombreArchivo: file.originalname,
      url: updated.urlCv as string,
      tamano: file.size,
    };
  }

  async list(query: ListVoluntariosQueryDto): Promise<{ data: VoluntarioConEdad[]; meta: PaginationMeta }> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const where: Prisma.VoluntarioWhereInput = {};

    if (query.estado) {
      where.estado = query.estado;
    }

    if (query.search) {
      where.OR = [
        { nombreCompleto: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { cedula: { contains: query.search, mode: 'insensitive' } },
        { ciudad: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {
        ...(query.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
        ...(query.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.voluntario.findMany({ where, orderBy: { creadoEn: 'desc' }, skip, take: limit }),
      this.prisma.voluntario.count({ where }),
    ]);

    const data = rows.map((v) => ({ ...v, edad: calcularEdad(v.fechaNacimiento) }));
    return { data, meta: buildPaginationMeta(page, limit, total) };
  }

  async findOne(id: number): Promise<VoluntarioConEdad> {
    const voluntario = await this.prisma.voluntario.findUnique({ where: { id } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }
    return { ...voluntario, edad: calcularEdad(voluntario.fechaNacimiento) };
  }

  async obtenerInfoCv(id: number): Promise<{ urlCv: string; nombreArchivoCv: string }> {
    const voluntario = await this.prisma.voluntario.findUnique({
      where: { id },
      select: { urlCv: true, nombreArchivoCv: true },
    });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }
    if (!voluntario.urlCv) {
      throw new NotFoundException('Este voluntario no tiene CV registrado');
    }
    return { urlCv: voluntario.urlCv, nombreArchivoCv: voluntario.nombreArchivoCv ?? 'cv.pdf' };
  }

  async updateStatus(id: number, dto: UpdateEstadoVoluntarioDto, adminId: number): Promise<Voluntario> {
    const existente = await this.prisma.voluntario.findUnique({ where: { id } });
    if (!existente) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    const actualizado = await this.prisma.voluntario.update({
      where: { id },
      data: { estado: dto.estado, notasAdmin: dto.notasAdmin ?? null },
    });

    this.emailService
      .sendVolunteerStatusUpdate(actualizado)
      .catch((error: Error) => this.logger.error('Error notificando cambio de estado al voluntario', error.stack));

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_volunteer_status',
      descripcion: `Estado cambiado a '${dto.estado}' para voluntario ID ${id}`,
      recursoId: id,
    });

    return actualizado;
  }

  async remove(id: number, adminId: number): Promise<void> {
    const voluntario = await this.prisma.voluntario.findUnique({ where: { id } });
    if (!voluntario) {
      throw new NotFoundException('Voluntario no encontrado');
    }

    if (voluntario.rutaArchivoCv) {
      await this.cloudinaryService
        .destroy(voluntario.rutaArchivoCv, 'raw')
        .catch((error: Error) => this.logger.error('Error eliminando CV de Cloudinary', error.stack));
    }

    await this.prisma.voluntario.delete({ where: { id } });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'delete_volunteer',
      descripcion: `Voluntario eliminado: ${voluntario.nombreCompleto} (ID: ${id})`,
    });
  }
}
