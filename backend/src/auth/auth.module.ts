import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * `JwtModule` se registra de forma global en `AppModule` (para que
 * `JwtAuthGuard`, usado en todos los módulos admin, pueda inyectar
 * `JwtService` sin que cada módulo tenga que reimportarlo).
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
