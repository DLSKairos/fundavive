import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: EmailAttachment[];
}

interface VoluntarioEmailData {
  nombreCompleto: string;
  cedula?: string | null;
  email: string;
  telefono?: string | null;
  ciudad?: string | null;
  direccion?: string | null;
  nivelEstudios?: string | null;
  profesionOcupacion?: string | null;
  habilidadesEspeciales?: string | null;
  disponibilidadHoraria?: string | null;
  motivacion?: string | null;
  areasInteres?: unknown;
  estado?: string | null;
  notasAdmin?: string | null;
  nombreArchivoCv?: string | null;
}

interface DonacionEmailData {
  nombreCompleto: string;
  email: string;
  monto: number | string;
  moneda: string;
  referenciaEpayco: string | null;
  esRecurrente?: boolean;
  frecuencia?: string | null;
}

interface ContactoEmailData {
  nombreCompleto: string;
  email: string;
  asunto: string;
  mensaje?: string;
}

const AREAS_INTERES_LABELS: Record<string, string> = {
  construccion: 'Construcción',
  educacion: 'Educación',
  salud: 'Salud',
  recaudacion: 'Recaudación',
  capacitacion: 'Capacitación',
  comunicaciones: 'Comunicaciones',
  juridico: 'Jurídico',
  administrativo: 'Administrativo',
};

const ESTADO_INFO: Record<string, { subject: string; message: string }> = {
  pendiente: {
    subject: 'Tu postulación está pendiente de revisión',
    message: 'Tu postulación ha sido registrada y está pendiente de revisión por nuestro equipo.',
  },
  en_revision: {
    subject: 'Tu postulación está en revisión',
    message: 'Nuestro equipo está revisando tu postulación. Te contactaremos pronto con una respuesta.',
  },
  aprobado: {
    subject: 'Tu postulación como voluntario fue aprobada',
    message:
      'Felicidades, tu postulación ha sido aprobada. Pronto nos pondremos en contacto contigo para contarte los siguientes pasos.',
  },
  rechazado: {
    subject: 'Actualización sobre tu postulación como voluntario',
    message:
      'Gracias por tu interés en ser voluntario de Fundavive. En esta ocasión no continuaremos con tu postulación, pero te invitamos a intentarlo nuevamente en el futuro.',
  },
  inactivo: {
    subject: 'Tu estado como voluntario ha cambiado',
    message: 'Tu estado como voluntario en Fundavive ha sido marcado como inactivo.',
  },
};

/**
 * Wrapper de Resend (API HTTP, NO SMTP) con plantillas HTML equivalentes a
 * las del backend legacy (rebrandeadas de FUNAC a FUNDAVIVE).
 *
 * IMPORTANTE: todos los métodos devuelven una Promise; es responsabilidad
 * del caller (controllers/services de negocio) invocarlos en modo
 * fire-and-forget (`.catch(err => logger.error(...))`) para no bloquear la
 * respuesta HTTP. Este servicio no traga sus propios errores para que quien
 * sí necesite esperar el envío (p. ej. `resend-receipt`) pueda hacerlo.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private client: Resend | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): Resend {
    if (!this.client) {
      this.client = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    }
    return this.client;
  }

  async send(options: SendEmailOptions): Promise<void> {
    const client = this.getClient();
    const from =
      options.from || this.configService.get<string>('EMAIL_FROM') || 'Fundavive <notificaciones@fundavive.org>';

    const { error } = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });

    if (error) {
      throw new Error(`Resend error: ${error.message ?? JSON.stringify(error)}`);
    }
  }

  private layout(title: string, subtitle: string, body: string): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #1a5276; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNDAVIVE</h1>
            <p style="color: #aed6f1; margin: 8px 0 0;">${subtitle}</p>
          </div>
          <div style="padding: 32px;">
            <h2 style="color: #1a5276; margin-top: 0;">${title}</h2>
            ${body}
          </div>
          <div style="background: #f8f9fa; padding: 16px; text-align: center; color: #888; font-size: 12px;">
            <p style="margin: 0;">Fundavive &copy; ${new Date().getFullYear()} | Todos los derechos reservados</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendVolunteerConfirmation(volunteer: VoluntarioEmailData): Promise<void> {
    const body = `
      <p>Estimado/a <strong>${volunteer.nombreCompleto}</strong>,</p>
      <p>Hemos recibido tu solicitud para ser parte de nuestro equipo de voluntarios. Nos alegra mucho contar con personas comprometidas como tú.</p>
      <div style="background: #eaf4fb; border-left: 4px solid #1a5276; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>Datos de tu registro:</strong></p>
        <ul style="margin: 8px 0 0; padding-left: 20px;">
          <li>Nombre: ${volunteer.nombreCompleto}</li>
          <li>Cédula: ${volunteer.cedula ?? ''}</li>
          <li>Email: ${volunteer.email}</li>
          <li>Ciudad: ${volunteer.ciudad ?? ''}</li>
        </ul>
      </div>
      <p>Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo pronto.</p>
      <p style="color: #666;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `;

    await this.send({
      to: volunteer.email,
      subject: 'Confirmación de registro como voluntario - Fundavive',
      html: this.layout('Registro de Voluntario Confirmado', 'Fundación Fundavive', body),
    });
  }

  async sendContactConfirmation(contact: ContactoEmailData): Promise<void> {
    const body = `
      <p>Hola <strong>${contact.nombreCompleto}</strong>,</p>
      <p>Gracias por comunicarte con nosotros. Hemos recibido tu mensaje con el asunto: <strong>"${contact.asunto}"</strong>.</p>
      <p>Nuestro equipo lo revisará y te responderemos a la mayor brevedad posible.</p>
      <p style="color: #666; font-size: 14px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    `;

    await this.send({
      to: contact.email,
      subject: 'Hemos recibido tu mensaje - Fundavive',
      html: this.layout('Hemos recibido tu mensaje', 'Fundación Fundavive', body),
    });
  }

  async sendAdminNotification(
    type: 'volunteer' | 'contact' | 'donation',
    data: VoluntarioEmailData | ContactoEmailData | DonacionEmailData,
  ): Promise<void> {
    const adminEmail = this.configService.get<string>('EMAIL_ADMIN');
    if (!adminEmail) return;

    const subjects: Record<typeof type, string> = {
      volunteer: 'Nuevo registro de voluntario',
      contact: 'Nuevo mensaje de contacto',
      donation: 'Nueva donación recibida',
    };

    let bodyHtml = '';
    if (type === 'volunteer') {
      const d = data as VoluntarioEmailData;
      bodyHtml = `
        <h3>Nuevo voluntario registrado</h3>
        <ul>
          <li><strong>Nombre:</strong> ${d.nombreCompleto}</li>
          <li><strong>Cédula:</strong> ${d.cedula ?? ''}</li>
          <li><strong>Email:</strong> ${d.email}</li>
          <li><strong>Teléfono:</strong> ${d.telefono ?? ''}</li>
          <li><strong>Ciudad:</strong> ${d.ciudad ?? ''}</li>
        </ul>
      `;
    } else if (type === 'contact') {
      const d = data as ContactoEmailData;
      bodyHtml = `
        <h3>Nuevo mensaje de contacto</h3>
        <ul>
          <li><strong>Nombre:</strong> ${d.nombreCompleto}</li>
          <li><strong>Email:</strong> ${d.email}</li>
          <li><strong>Asunto:</strong> ${d.asunto}</li>
        </ul>
        <p><strong>Mensaje:</strong></p>
        <p style="background: #f4f4f4; padding: 12px; border-radius: 4px;">${d.mensaje ?? ''}</p>
      `;
    } else {
      const d = data as DonacionEmailData;
      bodyHtml = `
        <h3>Nueva donación</h3>
        <ul>
          <li><strong>Donante:</strong> ${d.nombreCompleto}</li>
          <li><strong>Email:</strong> ${d.email}</li>
          <li><strong>Monto:</strong> ${d.moneda} ${d.monto}</li>
          <li><strong>Referencia:</strong> ${d.referenciaEpayco ?? ''}</li>
        </ul>
      `;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a5276;">Notificación Fundavive</h2>
          ${bodyHtml}
          <hr>
          <p style="color: #888; font-size: 12px;">Sistema de notificaciones Fundavive - ${new Date().toLocaleString('es-CO')}</p>
        </div>
      </body>
      </html>
    `;

    await this.send({
      to: adminEmail,
      subject: `[Fundavive] ${subjects[type]}`,
      html,
    });
  }

  private formatAreasInteres(areas: unknown): string {
    if (!areas) return '';
    const list = Array.isArray(areas) ? areas : typeof areas === 'string' ? (JSON.parse(areas) as string[]) : [];
    return (list as string[]).map((a) => AREAS_INTERES_LABELS[a] ?? a).join(', ');
  }

  private summaryRow(label: string, value?: string | null): string {
    if (!value) return '';
    return `<tr><td style="padding: 6px 0; color: #555; vertical-align: top; white-space: nowrap; padding-right: 12px;">${label}:</td><td style="padding: 6px 0;">${value}</td></tr>`;
  }

  /**
   * Envía el resumen completo de la postulación (con CV adjunto) al correo
   * de notificaciones de voluntariado. `cvBuffer` debe ser el buffer ya
   * disponible en memoria (del propio upload), NUNCA se re-descarga desde
   * Cloudinary (corrige el bug del legacy, que adjuntaba por `path` remoto).
   */
  async sendVolunteerApplicationSummary(
    volunteer: VoluntarioEmailData,
    cvBuffer: Buffer,
    cvFilename: string,
  ): Promise<void> {
    const notificationEmail = this.configService.get<string>('VOLUNTEER_NOTIFICATION_EMAIL');
    if (!notificationEmail) {
      this.logger.warn(
        'VOLUNTEER_NOTIFICATION_EMAIL no está configurado: no se envió el resumen de la postulación',
      );
      return;
    }
    const fromEmail = this.configService.get<string>('VOLUNTEER_FROM_EMAIL');

    const body = `
      <h2 style="color: #1a5276; margin-top: 0;">${volunteer.nombreCompleto}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${this.summaryRow('Cédula', volunteer.cedula)}
        ${this.summaryRow('Email', volunteer.email)}
        ${this.summaryRow('Teléfono', volunteer.telefono)}
        ${this.summaryRow('Ciudad', volunteer.ciudad)}
        ${this.summaryRow('Dirección', volunteer.direccion)}
        ${this.summaryRow('Nivel de estudios', volunteer.nivelEstudios)}
        ${this.summaryRow('Profesión / ocupación', volunteer.profesionOcupacion)}
        ${this.summaryRow('Disponibilidad', volunteer.disponibilidadHoraria)}
        ${this.summaryRow('Áreas de interés', this.formatAreasInteres(volunteer.areasInteres))}
        ${this.summaryRow('Habilidades especiales', volunteer.habilidadesEspeciales)}
        ${this.summaryRow('Motivación', volunteer.motivacion)}
      </table>
      <p style="color: #666; margin-top: 24px;">Se adjunta la hoja de vida enviada por el postulante.</p>
    `;

    await this.send({
      ...(fromEmail ? { from: `Fundavive Voluntariado <${fromEmail}>` } : {}),
      to: notificationEmail,
      subject: `Nueva postulación de voluntariado: ${volunteer.nombreCompleto}`,
      html: this.layout(volunteer.nombreCompleto, 'Nueva postulación de voluntariado', body),
      attachments: [{ filename: cvFilename || 'hoja-de-vida.pdf', content: cvBuffer }],
    });
  }

  /** Notifica al postulante cuando el admin cambia el estado de su postulación. */
  async sendVolunteerStatusUpdate(volunteer: VoluntarioEmailData): Promise<void> {
    const info = volunteer.estado ? ESTADO_INFO[volunteer.estado] : undefined;
    if (!info) return;

    const fromEmail = this.configService.get<string>('VOLUNTEER_FROM_EMAIL');

    const body = `
      <p>Estimado/a <strong>${volunteer.nombreCompleto}</strong>,</p>
      <p>${info.message}</p>
      ${
        volunteer.notasAdmin
          ? `<div style="background: #eaf4fb; border-left: 4px solid #1a5276; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>Nota de nuestro equipo:</strong></p>
              <p style="margin: 8px 0 0;">${volunteer.notasAdmin}</p>
            </div>`
          : ''
      }
      <p style="color: #666;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
    `;

    await this.send({
      ...(fromEmail ? { from: `Fundavive Voluntariado <${fromEmail}>` } : {}),
      to: volunteer.email,
      subject: `${info.subject} - Fundavive`,
      html: this.layout('Actualización de tu postulación', 'Fundación Fundavive', body),
    });
  }

  /** Envía comprobante de donación exitosa al donante. */
  async sendDonationReceipt(donation: DonacionEmailData): Promise<void> {
    const body = `
      <p>Estimado/a <strong>${donation.nombreCompleto}</strong>,</p>
      <p>Tu donación ha sido procesada exitosamente. Tu generosidad hace posible nuestro trabajo.</p>
      <div style="background: #eaf4fb; border: 1px solid #aed6f1; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px; color: #1a5276;">Detalle de la donación</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #555;">Referencia:</td>
            <td style="padding: 6px 0; font-weight: bold;">${donation.referenciaEpayco ?? ''}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #555;">Monto:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #1a5276; font-size: 18px;">${donation.moneda} $${Number(
              donation.monto,
            ).toLocaleString('es-CO')}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #555;">Fecha:</td>
            <td style="padding: 6px 0;">${new Date().toLocaleDateString('es-CO')}</td>
          </tr>
          ${
            donation.esRecurrente
              ? `<tr><td style="padding: 6px 0; color: #555;">Tipo:</td><td style="padding: 6px 0;">Donación recurrente (${donation.frecuencia})</td></tr>`
              : ''
          }
        </table>
      </div>
      <p>Conserva este correo como comprobante de tu donación.</p>
      <p>Con tu apoyo continuamos transformando vidas. <strong>Gracias</strong>.</p>
    `;

    await this.send({
      to: donation.email,
      subject: `Comprobante de donación Fundavive - ${donation.referenciaEpayco ?? ''}`,
      html: this.layout('Gracias por tu donación', 'Comprobante de Donación', body),
    });
  }
}
