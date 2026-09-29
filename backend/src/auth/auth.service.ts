import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LogActividadService } from '../audit/log-actividad.service';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logActividad: LogActividadService,
  ) {}

  async login(dto: LoginDto, ip: string | undefined): Promise<{ token: string; usuario: JwtPayload }> {
    const usuario = await this.prisma.usuarioAdmin.findUnique({ where: { username: dto.username } });

    // Mensaje 401 genérico en los tres casos (no existe / inactivo / password
    // incorrecto) para no filtrar si un username existe o no.
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValido = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValido) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { id: usuario.id, username: usuario.username, email: usuario.email };
    const token = this.jwtService.sign(payload);

    // Fire-and-forget: no deben bloquear ni poder tumbar la respuesta de login.
    this.prisma.usuarioAdmin
      .update({ where: { id: usuario.id }, data: { ultimoAcceso: new Date() } })
      .catch((error: Error) => this.logger.error('No se pudo actualizar último acceso', error.stack));

    void this.logActividad.registrar({
      usuarioId: usuario.id,
      accion: 'login',
      descripcion: 'Inicio de sesión exitoso',
      ipAddress: ip ?? null,
    });

    return { token, usuario: payload };
  }

  refresh(user: JwtPayload): { token: string } {
    const payload: JwtPayload = { id: user.id, username: user.username, email: user.email };
    return { token: this.jwtService.sign(payload) };
  }

  logout(user: JwtPayload, ip: string | undefined): void {
    // NOTA: no existe blacklist de tokens (igual que en el legacy): el JWT
    // emitido sigue siendo técnicamente válido hasta que expira por su
    // propio `exp`. Este logout es "cosmético": solo deja constancia en el
    // log de auditoría de que el usuario cerró sesión desde el panel.
    void this.logActividad.registrar({
      usuarioId: user.id,
      accion: 'logout',
      descripcion: 'Cierre de sesión',
      ipAddress: ip ?? null,
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto, ip: string | undefined): Promise<void> {
    if (dto.passwordNueva !== dto.passwordNuevaConfirmacion) {
      throw new BadRequestException('Las contraseñas nuevas no coinciden');
    }

    const usuario = await this.prisma.usuarioAdmin.findUnique({ where: { id: userId } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const passwordValido = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!passwordValido) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    const nuevoHash = await bcrypt.hash(dto.passwordNueva, SALT_ROUNDS);

    await this.prisma.usuarioAdmin.update({
      where: { id: userId },
      data: { passwordHash: nuevoHash },
    });

    void this.logActividad.registrar({
      usuarioId: userId,
      accion: 'change_password',
      descripcion: 'Contraseña actualizada',
      ipAddress: ip ?? null,
    });
  }
}
