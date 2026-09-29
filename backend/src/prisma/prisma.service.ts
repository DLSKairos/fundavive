import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from "@prisma/client";

/**
 * Wrapper de PrismaClient integrado al ciclo de vida de Nest:
 * - `onModuleInit`: conecta explícitamente al arrancar el módulo (falla rápido
 *   si la base de datos no está disponible, en lugar de conectar de forma
 *   perezosa en la primera query).
 * - `onModuleDestroy`: cierra el pool de conexiones al apagar la aplicación.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conexión a PostgreSQL establecida vía Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
