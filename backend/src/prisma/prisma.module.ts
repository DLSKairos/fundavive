import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Módulo global: cualquier módulo de la app puede inyectar `PrismaService`
 * sin necesidad de importar `PrismaModule` explícitamente en cada uno.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
