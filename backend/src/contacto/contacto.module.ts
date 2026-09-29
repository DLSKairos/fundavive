import { Module } from '@nestjs/common';
import { ContactoAdminController } from './contacto-admin.controller';
import { ContactoController } from './contacto.controller';
import { ContactoService } from './contacto.service';

@Module({
  controllers: [ContactoController, ContactoAdminController],
  providers: [ContactoService],
})
export class ContactoModule {}
