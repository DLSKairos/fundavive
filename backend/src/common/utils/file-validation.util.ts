import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common';

/**
 * Validaciones de archivo compartidas entre los módulos que reciben uploads
 * de imagen (carrusel, imágenes de sección, imagen del modal de noticias) o
 * de PDF (pdfs informativos), para no repetir la misma configuración de
 * `ParseFilePipe` en cada controller.
 */

export const IMAGE_MIME_TYPE_REGEX = /^image\/(jpeg|jpg|png|webp)$/;
export const IMAGE_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function buildImageFileValidationPipe(maxSizeBytes: number = IMAGE_MAX_SIZE_BYTES): ParseFilePipe {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: maxSizeBytes }),
      new FileTypeValidator({ fileType: IMAGE_MIME_TYPE_REGEX, skipMagicNumbersValidation: true }),
    ],
    fileIsRequired: true,
  });
}

export const PDF_MIME_TYPE_REGEX = /^application\/pdf$/;
export const PDF_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function buildPdfFileValidationPipe(): ParseFilePipe {
  return new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: PDF_MAX_SIZE_BYTES }),
      new FileTypeValidator({ fileType: PDF_MIME_TYPE_REGEX, skipMagicNumbersValidation: true }),
    ],
    fileIsRequired: true,
  });
}
