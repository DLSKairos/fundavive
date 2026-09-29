import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Guard de autenticación manual (sin `@nestjs/passport`): extrae el Bearer
 * token del header `Authorization`, lo verifica con `JwtService` (misma
 * librería `jsonwebtoken` por debajo) y adjunta el payload decodificado a
 * `request.user`. Se eligió esta vía en vez de una `PassportStrategy` porque
 * el flujo es simple (un único esquema Bearer, sin sesiones ni múltiples
 * estrategias) y así se evita una dependencia adicional.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const authHeader = request.headers['authorization'];

    if (!authHeader || Array.isArray(authHeader) || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación requerido');
    }

    const token = authHeader.slice('Bearer '.length).trim();

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
