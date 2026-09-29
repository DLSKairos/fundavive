import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';

const LOGIN_THROTTLE_TTL_MS = 15 * 60 * 1000;
const LOGIN_THROTTLE_LIMIT = 10;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: LOGIN_THROTTLE_LIMIT, ttl: LOGIN_THROTTLE_TTL_MS } })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const data = await this.authService.login(dto, req.ip);
    return { success: true, data, message: 'Inicio de sesión exitoso' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  refresh(@CurrentUser() user: JwtPayload) {
    const data = this.authService.refresh(user);
    return { success: true, data, message: 'Token renovado exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: JwtPayload, @Req() req: Request) {
    this.authService.logout(user, req.ip);
    return { success: true, message: 'Sesión cerrada exitosamente' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/password')
  async changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto, @Req() req: Request) {
    await this.authService.changePassword(user.id, dto, req.ip);
    return { success: true, message: 'Contraseña actualizada exitosamente' };
  }
}
