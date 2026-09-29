import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListLogsQueryDto } from '../logs/dto/list-logs-query.dto';
import { LogsService } from '../logs/logs.service';

/**
 * Reexpone `GET /api/admin/logs` bajo el path canónico
 * `/api/admin/settings/logs` reusando el mismo `LogsService` (sin duplicar
 * lógica). A diferencia del legacy, NO se monta también bajo
 * `/api/admin/config` (decisión tomada explícitamente para esta reimplementación).
 */
@UseGuards(JwtAuthGuard)
@Controller('admin/settings/logs')
export class SettingsLogsAdminController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async list(@Query() query: ListLogsQueryDto) {
    const { data, meta } = await this.logsService.list(query);
    return { success: true, data, pagination: meta };
  }
}
