import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filenameParts = resolvedParams.filename || [];
    const relativePath = filenameParts.join('/');
    
    // Prevent path traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(process.cwd(), 'public', 'uploads', safePath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      const fileBuffer = fs.readFileSync(fullPath);
      const mimeType = getMimeType(fullPath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error) {
    console.error('Uploads route error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
