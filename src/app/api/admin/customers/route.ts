import { NextResponse } from 'next/server';
import { CustomersDB, OrdersDB } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (id) {
      const customer = await CustomersDB.getById(id);
      if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      
      const allOrders = await OrdersDB.getAll();
      const customerOrders = allOrders.filter(
        o => o.customer_id === id || (customer.email && o.customer_email === customer.email) || (customer.phone && o.customer_phone === customer.phone)
      );

      return NextResponse.json({
        customer,
        orders: customerOrders
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        }
      });
    }

    const customers = await CustomersDB.getAll();
    return NextResponse.json(customers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Customers API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await CustomersDB.upsertUser(body);
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Customers POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record customer' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing customer id' }, { status: 400 });
    
    await CustomersDB.delete(id);
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Customers DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete customer' }, { status: 500 });
  }
}
