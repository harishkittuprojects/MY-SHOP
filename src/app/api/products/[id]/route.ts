import { NextResponse } from 'next/server';
import { ProductsDB } from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const rawParams = context?.params;
    const resolvedParams = rawParams instanceof Promise ? await rawParams : rawParams;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const product = await ProductsDB.getById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const mapped = {
      ...product,
      is_out_of_stock: (Number(product.stock_quantity) <= 0) || product.is_available === false,
    };

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('API Product GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}
