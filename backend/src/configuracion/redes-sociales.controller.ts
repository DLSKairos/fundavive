import { Controller, Get } from '@nestjs/common';
import { RedesSocialesService } from './redes-sociales.service';

@Controller('settings/social')
export class RedesSocialesController {
  constructor(private readonly redesSocialesService: RedesSocialesService) {}

  @Get()
  async get() {
    const data = await this.redesSocialesService.getMap();
    return { success: true, data };
  }
}
