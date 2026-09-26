import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'bts9hsym',
  api_key: process.env.CLOUDINARY_API_KEY || '347669756347217',
  api_secret: process.env.CLOUDINARY_API_SECRET || '4w5dqNT4Rlv7McQ6zIgk_mnJhHs',
  secure: true,
});

export interface UploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  resource_type: string;
}

/**
 * Upload a Base64 string or file buffer to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'image' | 'raw' | 'auto' | 'video';
  } = {}
): Promise<UploadResult> {
  const { folder = 'myshop', public_id, resource_type = 'auto' } = options;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      fileData,
      {
        folder,
        public_id,
        resource_type,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return reject(error || new Error('Upload failed'));
        }

        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          resource_type: result.resource_type,
        });
      }
    );
  });
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * List media assets from Cloudinary folder
 */
export async function listCloudinaryAssets(folder: string = 'myshop', maxResults: number = 50) {
  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();
    return result.resources || [];
  } catch (error) {
    console.error('Cloudinary list error:', error);
    return [];
  }
}

export default cloudinary;
