import { Injectable } from '@nestjs/common';
import { v2, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  /**
   * Télécharge une image vers Cloudinary
   * @param file Le fichier multer
   * @param folder Le dossier de destination (sous-dossier de jcmap)
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        {
          folder: `jcmap/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Erreur inconnue lors de l\'upload'));
          resolve(result);
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }

  /**
   * Supprime un fichier de Cloudinary via son public_id
   * @param publicId L'identifiant public du fichier sur Cloudinary
   */
  async deleteFile(publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }

  /**
   * Extrait le public_id d'une URL Cloudinary
   * @param url L'URL complète de l'image
   */
  extractPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('cloudinary')) return null;
    
    // Exemple d'URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/jcmap/avatars/abcde.jpg
    // Le public_id serait jcmap/avatars/abcde
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const fileName = lastPart.split('.')[0];
    
    // On remonte pour inclure jcmap/dossier
    const folderIndex = parts.indexOf('jcmap');
    if (folderIndex !== -1) {
      const folderPath = parts.slice(folderIndex).join('/');
      return folderPath.split('.')[0];
    }
    
    return fileName;
  }
}
