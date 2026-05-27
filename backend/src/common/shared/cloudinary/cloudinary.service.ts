/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  /**
   * Uploads an image to Cloudinary.
   *
   * @param file     - Multer file (buffer in memory)
   * @param folder   - Cloudinary folder path, e.g. "eie/electronics/42"
   * @param publicId - Public ID (without folder), e.g. "img-1"
   *
   * Uses `overwrite: true` + `invalidate: true` so re-uploading with the
   * same publicId replaces the previous image and purges CDN cache.
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    publicId: string,
  ): Promise<CloudinaryUploadResult> {
    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido (10 MB)`,
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [
            { width: 1000, height: 1000, crop: 'pad', background: 'white' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
        },
        (error: any, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(
              error ?? new Error('Error desconocido al subir imagen'),
            );
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  /** Deletes a single image by its full public ID. */
  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  /** Deletes all images whose public ID starts with the given prefix. */
  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix);
    } catch {
      // Ignore — no resources found under this prefix
    }
  }
}
