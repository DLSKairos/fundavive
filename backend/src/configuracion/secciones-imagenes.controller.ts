import { Controller, Get } from '@nestjs/common';
import { SeccionesImagenesService } from './secciones-imagenes.service';

@Controller('secciones-imagenes')
export class SeccionesImagenesController {
  constructor(private readonly seccionesImagenesService: SeccionesImagenesService) {}

  @Get()
  async get() {
    const data = await this.seccionesImagenesService.getPublic();
    return { success: true, data };
  }
}
