import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'node:stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export type CloudinaryResourceType = 'image' | 'raw' | 'video' | 'auto';

/**
 * Wrapper de la SDK de Cloudinary. Se usa `memoryStorage` de Multer en los
 * controllers (vía `FileInterceptor`) y aquí se sube el buffer manualmente
 * con `cloudinary.uploader.upload_stream`, en vez de `multer-storage-cloudinary`,
 * para tener control total sobre el flujo (poder inspeccionar/reusar el
 * buffer antes de subirlo, p. ej. para adjuntarlo también a un email).
 */
@Injectable()
export class CloudinaryService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  private uploadBuffer(
    buffer: Buffer,
    folder: string,
    resourceType: CloudinaryResourceType,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Cloudinary no devolvió resultado'));
            return;
          }
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(uploadStream);
    });
  }

  /** Sube una imagen (carrusel, secciones, modal de noticia, etc.). */
  uploadImage(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return this.uploadBuffer(buffer, folder, 'image');
  }

  /** Sube un archivo no-imagen (PDF, CV en PDF/DOC/DOCX) como `resource_type: raw`. */
  uploadRaw(buffer: Buffer, folder: string): Promise<UploadApiResponse> {
    return this.uploadBuffer(buffer, folder, 'raw');
  }

  async destroy(publicId: string, resourceType: CloudinaryResourceType = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}
