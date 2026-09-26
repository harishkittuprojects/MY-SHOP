import { NextResponse } from 'next/server';
import { OrdersDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const search = searchParams.get('search') || undefined;
  const email = searchParams.get('email') || undefined;

  try {
    let orders = await OrdersDB.getAll({ status, search });
    if (email) {
      orders = orders.filter(o => (o.customer_email || '').toLowerCase() === email.toLowerCase());
    }
    return NextResponse.json(orders);
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
