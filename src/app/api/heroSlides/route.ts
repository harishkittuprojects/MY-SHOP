import { NextResponse } from 'next/server';
import { HeroSlidesDB } from '@/lib/db';

export async function GET() {
  try {
    const slides = await HeroSlidesDB.getAll();
    return NextResponse.json(slides);
  } catch (error: any) {
    console.error('HeroSlides GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch hero slides' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const slide = await HeroSlidesDB.create(data, adminName);
    return NextResponse.json(slide);
  } catch (error: any) {
    console.error('HeroSlides POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create slide' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    if (!id) return NextResponse.json({ error: 'Slide ID required' }, { status: 400 });

    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const updated = await HeroSlidesDB.update(id, updates, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('HeroSlides PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Slide ID required' }, { status: 400 });

  try {
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    await HeroSlidesDB.delete(id, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('HeroSlides DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete slide' }, { status: 500 });
  }
}
