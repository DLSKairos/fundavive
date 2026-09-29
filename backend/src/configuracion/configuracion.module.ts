import { Module } from '@nestjs/common';
import { LogsModule } from '../logs/logs.module';
import { NoticiasModalAdminController } from './noticias-modal-admin.controller';
import { NoticiasModalController } from './noticias-modal.controller';
import { NoticiasModalService } from './noticias-modal.service';
import { RedesSocialesAdminController } from './redes-sociales-admin.controller';
import { RedesSocialesController } from './redes-sociales.controller';
import { RedesSocialesService } from './redes-sociales.service';
import { SeccionesImagenesAdminController } from './secciones-imagenes-admin.controller';
import { SeccionesImagenesController } from './secciones-imagenes.controller';
import { SeccionesImagenesService } from './secciones-imagenes.service';
import { SettingsLogsAdminController } from './settings-logs-admin.controller';
import { WhatsappAdminController } from './whatsapp-admin.controller';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [LogsModule],
  controllers: [
    RedesSocialesController,
    RedesSocialesAdminController,
    WhatsappController,
    WhatsappAdminController,
    NoticiasModalController,
    NoticiasModalAdminController,
    SeccionesImagenesController,
    SeccionesImagenesAdminController,
    SettingsLogsAdminController,
  ],
  providers: [RedesSocialesService, WhatsappService, NoticiasModalService, SeccionesImagenesService],
})
export class ConfiguracionModule {}
