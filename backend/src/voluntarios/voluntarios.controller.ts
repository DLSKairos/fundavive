import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CreateVoluntarioDto } from './dto/create-voluntario.dto';
import { VoluntariosService } from './voluntarios.service';

const CV_MAX_SIZE_BYTES = 5 * 1024 * 1024;
// Se valida solo por mimetype (igual que el `fileFilter` de multer en el
// legacy), sin inspección de magic numbers: los .doc antiguos (OLE) a veces
// no son detectados de forma consistente por `file-type` y el legacy nunca
// hizo esa validación adicional.
const CV_MIME_TYPE_REGEX =
  /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

@Controller('volunteers')
export class VoluntariosController {
  constructor(private readonly voluntariosService: VoluntariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVoluntarioDto) {
    const data = await this.voluntariosService.create(dto);
    return {
      success: true,
      data,
      message: 'Registro de voluntario exitoso. Pronto nos pondremos en contacto contigo.',
    };
  }

  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('cv', { storage: memoryStorage(), limits: { fileSize: CV_MAX_SIZE_BYTES } }))
  async uploadCv(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: CV_MAX_SIZE_BYTES }),
          new FileTypeValidator({ fileType: CV_MIME_TYPE_REGEX, skipMagicNumbersValidation: true }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    const data = await this.voluntariosService.uploadCv(id, file);
    return { success: true, data, message: 'CV subido exitosamente' };
  }
}
