import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { DonacionesService } from './donaciones.service';
import type { EpaycoWebhookBody } from './donaciones.service';
import { InitDonacionDto } from './dto/init-donacion.dto';

@Controller('donations')
export class DonacionesController {
  constructor(private readonly donacionesService: DonacionesService) {}

  @Post('init')
  @HttpCode(HttpStatus.CREATED)
  async init(@Body() dto: InitDonacionDto) {
    const data = await this.donacionesService.initDonation(dto);
    return { success: true, data, message: 'Donación registrada. Abriendo portal de pago.' };
  }

  /**
   * ePayco envía este webhook como `application/x-www-form-urlencoded`.
   * Nest/Express registran por defecto tanto el parser de JSON como el de
   * urlencoded (a menos que se pase `bodyParser: false` a `NestFactory`), así
   * que no se requiere configuración adicional para que `req.body` llegue
   * poblado en ambos formatos.
   *
   * SIEMPRE responde 200: `DonacionesService.handleWebhook` atrapa
   * internamente cualquier error para que ePayco no reintente en bucle.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() body: EpaycoWebhookBody) {
    return this.donacionesService.handleWebhook(body);
  }

  @Get(':referencia/status')
  async status(@Param('referencia') referencia: string) {
    const data = await this.donacionesService.getStatusByReferencia(referencia);
    return { success: true, data };
  }
}
