import { Injectable, NotFoundException } from '@nestjs/common';
import { LogActividadService } from '../audit/log-actividad.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfiguracionWhatsapp } from "@prisma/client";
import { UpdateWhatsappDto } from './dto/update-whatsapp.dto';

const DEFAULT_CODIGO_PAIS = '+57';

export interface ConfiguracionWhatsappConUrl extends ConfiguracionWhatsapp {
  urlWhatsapp: string;
}

@Injectable()
export class WhatsappService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logActividad: LogActividadService,
  ) {}

  private buildUrlWhatsapp(config: ConfiguracionWhatsapp): string {
    const numero = `${config.codigoPais}${config.numero}`.replace(/[+\s]/g, '');
    const texto = config.mensajePredeterminado ? `?text=${encodeURIComponent(config.mensajePredeterminado)}` : '';
    return `https://wa.me/${numero}${texto}`;
  }

  async getPublic(): Promise<ConfiguracionWhatsappConUrl> {
    const config = await this.prisma.configuracionWhatsapp.findFirst();
    if (!config) {
      throw new NotFoundException('Configuración de WhatsApp no encontrada');
    }
    return { ...config, urlWhatsapp: this.buildUrlWhatsapp(config) };
  }

  async getAdmin(): Promise<ConfiguracionWhatsapp | null> {
    return this.prisma.configuracionWhatsapp.findFirst();
  }

  /** Singleton manual: si ya existe una fila se actualiza, si no se crea. */
  async update(dto: UpdateWhatsappDto, adminId: number): Promise<ConfiguracionWhatsapp> {
    const existente = await this.prisma.configuracionWhatsapp.findFirst();

    const data = {
      codigoPais: dto.codigoPais ?? DEFAULT_CODIGO_PAIS,
      numero: dto.numero,
      mensajePredeterminado: dto.mensajePredeterminado ?? null,
      activo: dto.activo ?? true,
    };

    const actualizado = existente
      ? await this.prisma.configuracionWhatsapp.update({ where: { id: existente.id }, data })
      : await this.prisma.configuracionWhatsapp.create({ data });

    void this.logActividad.registrar({
      usuarioId: adminId,
      accion: 'update_whatsapp',
      descripcion: 'Configuración de WhatsApp actualizada',
      recursoId: actualizado.id,
    });

    return actualizado;
  }
}
