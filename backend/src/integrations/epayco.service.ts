import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'node:crypto';
import { EstadoDonacion } from "@prisma/client";

export interface EpaycoWebhookSignaturePayload {
  x_ref_payco?: string;
  x_transaction_id?: string;
  x_amount?: string;
  x_currency_code?: string;
  x_signature?: string;
}

const ESTADO_MAP: Record<string, EstadoDonacion> = {
  Aceptada: EstadoDonacion.completada,
  Rechazada: EstadoDonacion.fallida,
  Pendiente: EstadoDonacion.pendiente,
  Fallida: EstadoDonacion.fallida,
  Cancelada: EstadoDonacion.cancelada,
};

@Injectable()
export class EpaycoService {
  constructor(private readonly configService: ConfigService) {}

  /** Genera una referencia única tipo FUNDAVIVE-20260314-42. */
  generarReferencia(id: number | string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `FUNDAVIVE-${year}${month}${day}-${id}`;
  }

  /**
   * Verifica la firma SHA-256 del webhook de ePayco:
   * sha256(customerId^pKey^refPayco^transactionId^amount^currency).
   * En `EPAYCO_TEST_MODE=true`, si no viene `x_signature` se acepta (ePayco
   * en modo sandbox a veces no la envía).
   */
  verificarFirmaWebhook(payload: EpaycoWebhookSignaturePayload): boolean {
    const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature } = payload;

    if (this.configService.get<string>('EPAYCO_TEST_MODE') === 'true' && !x_signature) {
      return true;
    }

    if (!x_signature) return false;

    const signatureStr = [
      this.configService.get<string>('EPAYCO_CUSTOMER_ID'),
      this.configService.get<string>('EPAYCO_P_KEY'),
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
    ].join('^');

    const expectedSignature = crypto.createHash('sha256').update(signatureStr).digest('hex');

    return expectedSignature === x_signature;
  }

  mapearEstado(xTransactionState: string | undefined): EstadoDonacion {
    if (!xTransactionState) return EstadoDonacion.pendiente;
    return ESTADO_MAP[xTransactionState] ?? EstadoDonacion.pendiente;
  }
}
