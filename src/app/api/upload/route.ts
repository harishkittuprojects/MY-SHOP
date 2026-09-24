import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename - sanitize the original name
    const fileExt = path.extname(file.name) || '.jpg';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    const fileName = `${Date.now()}-${safeName}`;

    // Determine upload directory - use /tmp on serverless, public/uploads locally
    let uploadDir: string;
    let publicUrl: string;

    // Try writing to public/uploads first
    try {
      uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      publicUrl = `/uploads/${fileName}`;
    } catch (fsError: any) {
      // Fallback: if filesystem write fails (e.g., Hostinger serverless), 
      // return a base64 data URL so the image still works
      console.warn('Filesystem write failed, using base64 fallback:', fsError.message);
      const base64 = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      publicUrl = `data:${mimeType};base64,${base64}`;
    }

    return NextResponse.json({ publicUrl });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: `Failed to upload image: ${error.message}` }, { status: 500 });
  }
}
