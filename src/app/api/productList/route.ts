import { NextResponse } from 'next/server';
import { ProductsDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const isPopular = searchParams.get('is_popular') === '1' || searchParams.get('is_popular') === 'true';
  const isFeatured = searchParams.get('is_featured') === '1' || searchParams.get('is_featured') === 'true';

  try {
    const products = await ProductsDB.getAll({
      category,
      search,
      limit,
      is_popular: isPopular || undefined,
      is_featured: isFeatured || undefined,
    });

    const mapped = products.map(p => ({
      ...p,
      is_out_of_stock: p.stock_quantity <= 0 || !p.is_available,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('API Products GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const product = await ProductsDB.create(data, adminName);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Products POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const updated = await ProductsDB.update(id, updates, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('API Products PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

  try {
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    await ProductsDB.delete(id, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Products DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
