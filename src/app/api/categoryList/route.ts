import { NextResponse } from 'next/server';
import { CategoriesDB } from '@/lib/db';

export async function GET() {
  try {
    const categories = await CategoriesDB.getAll();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('API Categories GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const category = await CategoriesDB.create(data, adminName);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('API Categories POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const updated = await CategoriesDB.update(id, updates, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('API Categories PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

  try {
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    await CategoriesDB.delete(id, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Categories DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
