import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';
import { DonacionesModule } from './donaciones/donaciones.module';
import { ContactoModule } from './contacto/contacto.module';
import { ContenidoModule } from './contenido/contenido.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { MultimediaModule } from './multimedia/multimedia.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LogsModule } from './logs/logs.module';

const GLOBAL_THROTTLE_TTL_MS = 15 * 60 * 1000;
const GLOBAL_THROTTLE_LIMIT = 100;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: GLOBAL_THROTTLE_TTL_MS, limit: GLOBAL_THROTTLE_LIMIT }]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        // `expiresIn` de `@nestjs/jwt` tipa este valor como `number | StringValue`
        // (formato de la librería `ms`, p. ej. '8h'); viene de env como string
        // simple, de ahí el cast.
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') as `${number}${'s' | 'm' | 'h' | 'd'}` },
      }),
    }),
    PrismaModule,
    IntegrationsModule,
    AuditModule,
    AuthModule,
    VoluntariosModule,
    DonacionesModule,
    ContactoModule,
    ContenidoModule,
    ConfiguracionModule,
    MultimediaModule,
    DashboardModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Rate limiting global: 100 req/15min. Rutas específicas (p. ej. login)
    // pueden apretar el límite con `@Throttle(...)` a nivel de método.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
