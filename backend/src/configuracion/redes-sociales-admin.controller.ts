import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { RedesSocialesService } from './redes-sociales.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/settings/social')
export class RedesSocialesAdminController {
  constructor(private readonly redesSocialesService: RedesSocialesService) {}

  @Get()
  async get() {
    const data = await this.redesSocialesService.getMap();
    return { success: true, data };
  }

  @Put()
  async update(@Body() body: Record<string, unknown>, @CurrentUser() user: JwtPayload) {
    const data = await this.redesSocialesService.update(body, user.id);
    return { success: true, data, message: 'Redes sociales actualizadas exitosamente' };
  }
}
