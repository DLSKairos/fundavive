import { Module } from '@nestjs/common';
import { DonacionesAdminController } from './donaciones-admin.controller';
import { DonacionesController } from './donaciones.controller';
import { DonacionesService } from './donaciones.service';

@Module({
  controllers: [DonacionesController, DonacionesAdminController],
  providers: [DonacionesService],
})
export class DonacionesModule {}
