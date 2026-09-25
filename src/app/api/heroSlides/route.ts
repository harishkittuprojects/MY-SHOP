import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    const slides = await mysql.query('SELECT * FROM hero_slides WHERE active = TRUE ORDER BY created_at DESC');
    // Fallback if empty
    if (slides.length === 0) {
      return NextResponse.json([
        { image_url: "/products/cow-milk-v1.png", title: "Pure Desi Cow Milk", subtitle: "Delivered fresh every morning in glass bottles" },
        { image_url: "/products/groundnut-oil-v1.png", title: "Wood-Pressed Oils", subtitle: "Traditional wooden ghani cold-pressed extraction" },
        { image_url: "/products/mango-pickle-v1.png", title: "Authentic Andhra Pickles", subtitle: "Handcrafted using traditional recipes and pure oil" },
        { image_url: "/products/ghee-v1.png", title: "Bilona Desi Cow Ghee", subtitle: "Pure golden aroma prepared from curd" },
      ]);
    }
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await mysql.insert('hero_slides', {
      image_url: data.image_url,
      title: data.title || '',
      subtitle: data.subtitle || '',
      active: true
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await mysql.remove('hero_slides', 'id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

