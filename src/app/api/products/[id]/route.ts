import { NextResponse } from 'next/server';
import { ProductsDB } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const product = await ProductsDB.getById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const mapped = {
      ...product,
      is_out_of_stock: product.stock_quantity <= 0 || !product.is_available,
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('API Product GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}
