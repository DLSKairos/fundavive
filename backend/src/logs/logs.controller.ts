import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { LogsService } from './logs.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async list(@Query() query: ListLogsQueryDto) {
    const { data, meta } = await this.logsService.list(query);
    return { success: true, data, pagination: meta };
  }
}
