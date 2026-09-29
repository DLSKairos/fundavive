import { Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ContactoService } from './contacto.service';
import { ListContactoQueryDto } from './dto/list-contacto-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/contact')
export class ContactoAdminController {
  constructor(private readonly contactoService: ContactoService) {}

  @Get()
  async list(@Query() query: ListContactoQueryDto) {
    const { data, meta } = await this.contactoService.list(query);
    return { success: true, data, pagination: meta };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.contactoService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    const data = await this.contactoService.markAsRead(id, user.id);
    return { success: true, data, message: 'Mensaje marcado como leído' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.contactoService.remove(id);
    return { success: true, message: 'Mensaje de contacto eliminado exitosamente' };
  }
}
