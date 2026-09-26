import { NextResponse } from 'next/server';
import { ProductsDB, InventoryLogsDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id') || undefined;

  try {
    const products = await ProductsDB.getAll();
    const logs = await InventoryLogsDB.getAll(productId);

    // Compute inventory stats
    const totalInventoryItems = products.reduce((acc, p) => acc + (Number(p.stock_quantity) || 0), 0);
    const lowStockItems = products.filter(p => (Number(p.stock_quantity) || 0) <= 5);
    const outOfStockItems = products.filter(p => (Number(p.stock_quantity) || 0) <= 0 || !p.is_available);

    return NextResponse.json({
      success: true,
      products,
      logs,
      stats: {
        totalInventoryItems,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        totalProductsCount: products.length,
      }
    });
  } catch (error: any) {
    console.error('Inventory GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { product_id, change_amount, reason } = data;
    const adminName = request.headers.get('x-admin-name') || 'Admin';

    if (!product_id || change_amount === undefined) {
      return NextResponse.json({ error: 'product_id and change_amount are required' }, { status: 400 });
    }

    const newStock = await ProductsDB.adjustStock(
      product_id,
      Number(change_amount),
      reason || 'Manual Adjustment',
      adminName
    );

    return NextResponse.json({ success: true, newStock });
  } catch (error: any) {
    console.error('Inventory POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update inventory' }, { status: 500 });
  }
}
