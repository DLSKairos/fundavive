import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { buildPdfFileValidationPipe, PDF_MAX_SIZE_BYTES } from '../common/utils/file-validation.util';
import { UploadPdfDto } from './dto/upload-pdf.dto';
import { PdfsService } from './pdfs.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/pdfs')
export class PdfsAdminController {
  constructor(private readonly pdfsService: PdfsService) {}

  @Get()
  async list() {
    const data = await this.pdfsService.listAdmin();
    return { success: true, data };
  }

  @Post()
  @UseInterceptors(FileInterceptor('pdf', { storage: memoryStorage(), limits: { fileSize: PDF_MAX_SIZE_BYTES } }))
  async upload(
    @Body() dto: UploadPdfDto,
    @UploadedFile(buildPdfFileValidationPipe()) file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    const data = await this.pdfsService.upload(file, dto.titulo, dto.descripcion, user.id);
    return { success: true, data, message: 'PDF subido exitosamente' };
  }

  @Patch(':id/toggle')
  async toggle(@Param('id', ParseIntPipe) id: number) {
    const data = await this.pdfsService.toggle(id);
    return { success: true, data, message: 'Estado del PDF actualizado' };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.pdfsService.remove(id, user.id);
    return { success: true, message: 'PDF eliminado exitosamente' };
  }
}
