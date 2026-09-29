import { Module } from '@nestjs/common';
import { VoluntariosAdminController } from './voluntarios-admin.controller';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';

@Module({
  controllers: [VoluntariosController, VoluntariosAdminController],
  providers: [VoluntariosService],
})
export class VoluntariosModule {}
