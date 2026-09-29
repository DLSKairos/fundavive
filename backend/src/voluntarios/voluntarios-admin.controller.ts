import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { Readable } from 'node:stream';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ListVoluntariosQueryDto } from './dto/list-voluntarios-query.dto';
import { UpdateEstadoVoluntarioDto } from './dto/update-estado-voluntario.dto';
import { VoluntariosService } from './voluntarios.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/volunteers')
export class VoluntariosAdminController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Get()
  async list(@Query() query: ListVoluntariosQueryDto) {
    const { data, meta } = await this.voluntariosService.list(query);
    return { success: true, data, pagination: meta };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.voluntariosService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/cv/download')
  async downloadCv(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    const { urlCv, nombreArchivoCv } = await this.voluntariosService.obtenerInfoCv(id);

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(urlCv);
    } catch {
      throw new BadGatewayException('Error al descargar el archivo');
    }

    if (!upstream.ok || !upstream.body) {
      throw new BadGatewayException('Error al descargar el archivo');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(nombreArchivoCv)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    const nodeStream = Readable.fromWeb(upstream.body as never);
    nodeStream.pipe(res);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoVoluntarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.voluntariosService.updateStatus(id, dto, user.id);
    return { success: true, data, message: 'Estado del voluntario actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.voluntariosService.remove(id, user.id);
    return { success: true, message: 'Voluntario eliminado exitosamente' };
  }
}
