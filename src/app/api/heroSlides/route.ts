import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    const slides = await mysql.query('SELECT * FROM hero_slides WHERE active = TRUE ORDER BY created_at DESC');
    // Fallback if empty
    if (slides.length === 0) {
      return NextResponse.json([
        { image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=1920", title: "iPhone 16 Pro Series", subtitle: "Built for Apple Intelligence" },
        { image_url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1920", title: "Galaxy S25 Ultra", subtitle: "Epic Galaxy AI in Your Hands" },
        { image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=1920", title: "Google Pixel 9 Pro", subtitle: "Engineered by Google, Powered by Gemini" },
        { image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=1920", title: "Next-Gen 5G Powerhouses", subtitle: "Best Deals & No Cost EMI" },
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

