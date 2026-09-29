import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { ContenidoService } from './contenido.service';
import { UpdatePaginaContenidoDto } from './dto/update-pagina-contenido.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin/pages')
export class ContenidoAdminController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Get()
  async listGrouped() {
    const data = await this.contenidoService.listAdminGrouped();
    return { success: true, data };
  }

  @Get(':pagina')
  async getByPagina(@Param('pagina') pagina: string) {
    const data = await this.contenidoService.getAdminByPagina(pagina);
    return { success: true, data };
  }

  @Put(':pagina')
  async updatePagina(
    @Param('pagina') pagina: string,
    @Body() dto: UpdatePaginaContenidoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.contenidoService.updatePagina(pagina, dto.secciones, user.id);
    return { success: true, data, message: 'Contenido de la página actualizado exitosamente' };
  }
}
