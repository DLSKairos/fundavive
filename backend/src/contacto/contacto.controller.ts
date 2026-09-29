import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';

@Controller('contact')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateContactoDto) {
    const contacto = await this.contactoService.create(dto);
    return {
      success: true,
      data: { id: contacto.id, creadoEn: contacto.creadoEn },
      message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
    };
  }
}
