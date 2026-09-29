import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';
import { WhatsappService } from './whatsapp.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/settings/whatsapp')
export class WhatsappAdminController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get()
  async get() {
    const data = await this.whatsappService.getAdmin();
    return { success: true, data };
  }

  @Put()
  async update(@Body() dto: UpdateWhatsappDto, @CurrentUser() user: JwtPayload) {
    const data = await this.whatsappService.update(dto, user.id);
    return { success: true, data, message: 'Configuración de WhatsApp actualizada exitosamente' };
  }
}
