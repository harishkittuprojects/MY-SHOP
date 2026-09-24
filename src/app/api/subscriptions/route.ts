import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');

  try {
    if (id) {
      const sub = await mysql.getOne('subscriptions', 'id', id);
      if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      // Join with products if needed
      if (sub.product_id) {
        const product = await mysql.getOne('products', 'id', sub.product_id);
        sub.products = product;
      }
      return NextResponse.json(sub);
    }

    let query = 'SELECT * FROM subscriptions';
    const params: any[] = [];

    if (email) {
      query += ' WHERE customer_email = ? OR email = ?';
      params.push(email, email);
    }

    query += ' ORDER BY created_at DESC';
    const subs = await mysql.query(query, params);
    return NextResponse.json(subs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}



export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Self-healing: Ensure columns exist
    try {
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS location_link TEXT`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS street VARCHAR(255)`);
    } catch (e) { /* ignore */ }

    const result = await mysql.insert('subscriptions', {
      customer_name: data.customer_name,
      customer_email: data.customer_email || data.email,
      customer_phone: data.customer_phone || data.phone,
      address: data.address,
      location_link: data.location_link || data.location,
      payment_screenshot_url: data.payment_screenshot_url,
      product_id: data.product_id,
      quantity: data.quantity,
      street: data.street,
      status: data.status || 'active'
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Subscription Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    // First, delete all related deliveries to avoid foreign key constraints
    await mysql.query('DELETE FROM deliveries WHERE subscription_id = ?', [id]);
    
    // Then delete the subscription
    await mysql.remove('subscriptions', 'id', id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete Subscription Error:', error);
    return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
  }
}

