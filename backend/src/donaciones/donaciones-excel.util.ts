import * as ExcelJS from 'exceljs';
import { Donacion } from "@prisma/client";

const HEADER_FILL_COLOR = 'FF1A5276'; // Azul institucional corporativo.

/**
 * Genera el `.xlsx` de exportación de donaciones (mismas columnas y estilo
 * del backend legacy).
 */
export async function buildDonacionesWorkbook(donaciones: Donacion[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Fundavive';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Donaciones');

  sheet.columns = [
    { header: 'Nombre', key: 'nombreCompleto', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Cedula', key: 'cedula', width: 15 },
    { header: 'Monto', key: 'monto', width: 15, style: { numFmt: '#,##0.00' } },
    { header: 'Moneda', key: 'moneda', width: 10 },
    { header: 'Estado', key: 'estado', width: 15 },
    { header: 'Referencia', key: 'referenciaEpayco', width: 25 },
    { header: 'Recurrente', key: 'esRecurrente', width: 12 },
    { header: 'Frecuencia', key: 'frecuencia', width: 15 },
    { header: 'Muro Donantes', key: 'aparecerMuroDonantes', width: 16 },
    { header: 'Fecha Registro', key: 'creadoEn', width: 20 },
    { header: 'Fecha Pago', key: 'fechaPago', width: 20 },
  ];

  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL_COLOR } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const donacion of donaciones) {
    sheet.addRow({
      nombreCompleto: donacion.nombreCompleto,
      email: donacion.email,
      cedula: donacion.cedula ?? '',
      monto: Number(donacion.monto),
      moneda: donacion.moneda,
      estado: donacion.estado,
      referenciaEpayco: donacion.referenciaEpayco ?? '',
      esRecurrente: donacion.esRecurrente ? 'Si' : 'No',
      frecuencia: donacion.frecuencia ?? '',
      aparecerMuroDonantes: donacion.aparecerMuroDonantes ? 'Si' : 'No',
      creadoEn: donacion.creadoEn ? new Date(donacion.creadoEn).toLocaleString('es-CO') : '',
      fechaPago: donacion.fechaPago ? new Date(donacion.fechaPago).toLocaleString('es-CO') : '',
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
