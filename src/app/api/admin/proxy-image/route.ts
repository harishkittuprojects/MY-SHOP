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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // If it's an external URL (http / https)
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      const response = await fetch(rawUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MadurProxy/1.0)',
        },
      });

      if (!response.ok) {
        return new NextResponse('Failed to fetch image', { status: response.status });
      }

      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const arrayBuffer = await response.arrayBuffer();

      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Otherwise, treat as a local path
    const sanitizedPath = rawUrl.replace(/^\/+/, ''); // remove leading slash
    const possiblePaths = [
      path.join(process.cwd(), 'public', sanitizedPath),
      path.join(process.cwd(), sanitizedPath),
      path.join(process.cwd(), 'public', 'uploads', path.basename(sanitizedPath)),
    ];

    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath) && fs.statSync(testPath).isFile()) {
        const fileBuffer = fs.readFileSync(testPath);
        const mimeType = getMimeType(testPath);

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error: any) {
    console.error('Proxy Image Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
