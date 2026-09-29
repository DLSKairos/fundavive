import { Controller, Get, Param, ParseIntPipe, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { DonacionesService } from './donaciones.service';
import { buildDonacionesWorkbook } from './donaciones-excel.util';
import { DonacionFiltersDto } from './dto/donacion-filters.dto';
import { ListDonacionesQueryDto } from './dto/list-donaciones-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/donations')
export class DonacionesAdminController {
  constructor(private readonly donacionesService: DonacionesService) {}

  // Declarada ANTES de ':id' para que Nest no la confunda con `GET /:id`.
  @Get('export')
  async export(@Query() filters: DonacionFiltersDto, @Res() res: Response): Promise<void> {
    const donaciones = await this.donacionesService.findForExport(filters);
    const buffer = await buildDonacionesWorkbook(donaciones);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="donaciones_${Date.now()}.xlsx"`);
    res.send(buffer);
  }

  @Get()
  async list(@Query() query: ListDonacionesQueryDto) {
    const { data, meta } = await this.donacionesService.list(query);
    return { success: true, data, pagination: meta };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.donacionesService.findOne(id);
    return { success: true, data };
  }

  @Post(':id/resend-receipt')
  async resendReceipt(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.donacionesService.resendReceipt(id, user.id);
    return { success: true, message: 'Comprobante reenviado exitosamente' };
  }
}
