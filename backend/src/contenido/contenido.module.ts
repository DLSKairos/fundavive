import { Module } from '@nestjs/common';
import { ContenidoAdminController } from './contenido-admin.controller';
import { ContenidoController } from './contenido.controller';
import { ContenidoService } from './contenido.service';

@Module({
  controllers: [ContenidoController, ContenidoAdminController],
  providers: [ContenidoService],
})
export class ContenidoModule {}
