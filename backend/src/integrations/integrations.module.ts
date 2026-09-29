import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { EmailService } from './email.service';
import { EpaycoService } from './epayco.service';

/**
 * Agrupa los wrappers de integraciones externas (Cloudinary, Resend, ePayco)
 * usados por varios módulos de dominio. Global para no tener que
 * reimportarlo en cada módulo que los necesite.
 */
@Global()
@Module({
  providers: [CloudinaryService, EmailService, EpaycoService],
  exports: [CloudinaryService, EmailService, EpaycoService],
})
export class IntegrationsModule {}
