import { BadGatewayException, Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Readable } from 'node:stream';
import { CarruselService } from './carrusel.service';
import { PdfsService } from './pdfs.service';

@Controller('home')
export class HomeController {
  constructor(
    private readonly carruselService: CarruselService,
    private readonly pdfsService: PdfsService,
  ) {}

  @Get('images')
  async images() {
    const data = await this.carruselService.listPublic();
    return { success: true, data };
  }

  @Get('pdfs')
  async pdfs() {
    const data = await this.pdfsService.listPublic();
    return { success: true, data };
  }

  private async streamPdf(id: number, res: Response, disposition: 'attachment' | 'inline'): Promise<void> {
    const { urlPdf, nombreArchivo } = await this.pdfsService.obtenerInfoDescarga(id);

    let upstream: globalThis.Response;
    try {
      upstream = await fetch(urlPdf);
    } catch {
      throw new BadGatewayException('Error al descargar el archivo');
    }

    if (!upstream.ok || !upstream.body) {
      throw new BadGatewayException('Error al descargar el archivo');
    }

    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(nombreArchivo)}"`);
    res.setHeader('Content-Type', 'application/pdf');

    const nodeStream = Readable.fromWeb(upstream.body as never);
    nodeStream.pipe(res);
  }

  @Get('pdfs/:id/download')
  async download(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    // Fire-and-forget: no debe bloquear ni retrasar el streaming de la respuesta.
    void this.pdfsService.registrarDescarga(id);
    await this.streamPdf(id, res, 'attachment');
  }

  @Get('pdfs/:id/view')
  async view(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<void> {
    await this.streamPdf(id, res, 'inline');
  }
}
