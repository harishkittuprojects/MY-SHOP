import { NextResponse } from 'next/server';
import { ProductsDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  try {
    if (productId) {
      const variants = await ProductsDB.getVariants(productId);
      return NextResponse.json({ success: true, variants });
    }

    // Return all products with their variants
    const products = await ProductsDB.getAll();
    const allVariants: any[] = [];

    products.forEach((p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        p.variants.forEach((v: any) => {
          allVariants.push({
            ...v,
            product_id: p.id,
            product_name: p.name,
            product_image: p.image_url || (p.images && p.images[0]) || '',
            category_name: p.category_name || p.category || '',
          });
        });
      }
    });

    return NextResponse.json({
      success: true,
      variants: allVariants,
      totalVariants: allVariants.length,
    });
  } catch (error: any) {
    console.error('API Variants GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch variants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { product_id, ...variantData } = data;
    const adminName = request.headers.get('x-admin-name') || 'Admin';

    if (!product_id) {
      return NextResponse.json({ error: 'product_id is required' }, { status: 400 });
    }

    const created = await ProductsDB.addVariant(product_id, variantData, adminName);
    return NextResponse.json({ success: true, variant: created });
  } catch (error: any) {
    console.error('API Variants POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create variant' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { product_id, variant_id, ...updates } = data;
    const adminName = request.headers.get('x-admin-name') || 'Admin';

    if (!product_id || !variant_id) {
      return NextResponse.json({ error: 'product_id and variant_id are required' }, { status: 400 });
    }

    const updated = await ProductsDB.updateVariant(product_id, variant_id, updates, adminName);
    return NextResponse.json({ success: true, variant: updated });
  } catch (error: any) {
    console.error('API Variants PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update variant' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  const variantId = searchParams.get('variant_id');
  const adminName = request.headers.get('x-admin-name') || 'Admin';

  if (!productId || !variantId) {
    return NextResponse.json({ error: 'product_id and variant_id are required' }, { status: 400 });
  }

  try {
    await ProductsDB.deleteVariant(productId, variantId, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Variants DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete variant' }, { status: 500 });
  }
}
