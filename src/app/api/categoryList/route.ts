import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';
import { categories as staticCategories } from '@/lib/data';

export async function GET() {
  try {
    const categories = await mysql.query('SELECT * FROM categories ORDER BY name ASC');
    
    // Fallback for local dev or empty DB
    if (Array.isArray(categories) && categories.length === 0) {
      console.log('No categories in DB, falling back to static data');
      return NextResponse.json(staticCategories);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('API Categories Error:', error);
    // Fallback on total failure
    return NextResponse.json(staticCategories);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await mysql.insert('categories', {
      id: `cat_${Date.now()}`,
      name: data.name,
      image_url: data.image_url || ''
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Categories POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    const result = await mysql.update('categories', {
      name: data.name,
      image_url: data.image_url
    }, 'id', data.id);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Categories PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await mysql.remove('categories', 'id', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Categories DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

