import { Global, Module } from '@nestjs/common';
import { LogActividadService } from './log-actividad.service';

@Global()
@Module({
  providers: [LogActividadService],
  exports: [LogActividadService],
})
export class AuditModule {}
