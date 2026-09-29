import { Controller, Get, Param } from '@nestjs/common';
import { ContenidoService } from './contenido.service';

@Controller('pages')
export class ContenidoController {
  constructor(private readonly contenidoService: ContenidoService) {}

  @Get(':pagina')
  async getByPagina(@Param('pagina') pagina: string) {
    const data = await this.contenidoService.getPublicByPagina(pagina);
    return { success: true, data };
  }
}
