import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { MediaGalleryDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, fileData, folder = 'myshop', resource_type = 'auto', alt_text = '' } = body;

    const dataToUpload = image || fileData;
    if (!dataToUpload) {
      return NextResponse.json({ error: 'No image or file data provided' }, { status: 400 });
    }

    // Upload directly to Cloudinary
    const uploadResult = await uploadToCloudinary(dataToUpload, {
      folder,
      resource_type: resource_type as any,
    });

    // Save record to media_gallery table in Supabase
    const savedRecord = await MediaGalleryDB.save({
      public_id: uploadResult.public_id,
      url: uploadResult.url,
      secure_url: uploadResult.secure_url,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      bytes: uploadResult.bytes,
      width: uploadResult.width || null,
      height: uploadResult.height || null,
      folder: folder,
      alt_text: alt_text,
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      media: savedRecord,
    });
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
