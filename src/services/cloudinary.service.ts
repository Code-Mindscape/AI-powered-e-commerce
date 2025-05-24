import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryService {
  async uploadImage(file: string): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(file);
      return result.secure_url;
    } catch (error) {
      throw new Error('Image upload failed');
    }
  }
}