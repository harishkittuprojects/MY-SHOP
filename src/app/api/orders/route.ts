import { NextResponse } from 'next/server';
import { OrdersDB } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const email = searchParams.get('email') || undefined;
  const phone = searchParams.get('phone') || undefined;

  try {
    let orders = await OrdersDB.getAll({ status, search });
    if (email || phone) {
      const eLower = (email || '').toLowerCase().trim();
      const pClean = (phone || email || '').replace(/[^0-9]/g, '');
      orders = orders.filter(o => {
        const oEmail = (o.customer_email || '').toLowerCase().trim();
        const oPhone = (o.customer_phone || '').replace(/[^0-9]/g, '');
        if (eLower && oEmail === eLower) return true;
        if (pClean.length >= 10 && oPhone.length >= 10 && (pClean.includes(oPhone) || oPhone.includes(pClean))) return true;
        return false;
      });
    }
    return NextResponse.json(orders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const order = await OrdersDB.create(data);
    return NextResponse.json({ success: true, order, id: order.id });
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, order_status, payment_status } = data;
    if (!id || !order_status) {
      return NextResponse.json({ error: 'Order ID and order_status required' }, { status: 400 });
    }

    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const updated = await OrdersDB.updateStatus(id, order_status, payment_status, adminName);
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('Order Update Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }
  try {
    await OrdersDB.delete(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
