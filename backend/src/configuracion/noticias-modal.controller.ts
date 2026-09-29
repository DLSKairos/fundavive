import { Controller, Get } from '@nestjs/common';
import { NoticiasModalService } from './noticias-modal.service';

@Controller('noticias-modal')
export class NoticiasModalController {
  constructor(private readonly noticiasModalService: NoticiasModalService) {}

  @Get()
  async get() {
    const data = await this.noticiasModalService.getPublic();
    return { success: true, data };
  }
}
