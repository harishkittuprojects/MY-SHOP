import { NextResponse } from 'next/server';
import { MediaGalleryDB } from '@/lib/db';
import { deleteFromCloudinary, listCloudinaryAssets } from '@/lib/cloudinary';

export async function GET() {
  try {
    let items = await MediaGalleryDB.getAll();
    if (items.length === 0) {
      // Try listing from Cloudinary directly
      const cloudItems = await listCloudinaryAssets('myshop', 40);
      items = (cloudItems || []).map((c: any) => ({
        id: c.asset_id || c.public_id,
        public_id: c.public_id,
        url: c.url,
        secure_url: c.secure_url,
        format: c.format,
        bytes: c.bytes,
        resource_type: c.resource_type,
        created_at: c.created_at
      }));
    }
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Gallery GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const public_id = searchParams.get('public_id');

  try {
    if (public_id) {
      await deleteFromCloudinary(public_id);
    }
    if (id) {
      await MediaGalleryDB.delete(id);
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Gallery DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}
