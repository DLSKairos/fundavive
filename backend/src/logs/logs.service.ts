import { Injectable } from '@nestjs/common';
import { PaginationMeta } from '../common/interfaces/pagination-meta.interface';
import { buildPaginationMeta, normalizePagination } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from "@prisma/client";
import { ListLogsQueryDto } from './dto/list-logs-query.dto';

export type LogActividadConUsuario = Prisma.LogActividadAdminGetPayload<{
  include: { usuario: { select: { id: true; username: true } } };
}>;

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListLogsQueryDto): Promise<{ data: LogActividadConUsuario[]; meta: PaginationMeta }> {
    const { page, limit, skip } = normalizePagination(query.page, query.limit);

    const where: Prisma.LogActividadAdminWhereInput = {};

    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {
        ...(query.fechaDesde ? { gte: new Date(query.fechaDesde) } : {}),
        ...(query.fechaHasta ? { lte: new Date(query.fechaHasta) } : {}),
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.logActividadAdmin.findMany({
        where,
        include: { usuario: { select: { id: true, username: true } } },
        orderBy: { creadoEn: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.logActividadAdmin.count({ where }),
    ]);

    return { data: rows, meta: buildPaginationMeta(page, limit, total) };
  }
}
