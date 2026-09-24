import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const subId = searchParams.get('subscription_id');
  const subIds = searchParams.get('subscription_ids'); // Comma separated
  const gteDate = searchParams.get('gte_date');

  try {
    let sql = 'SELECT * FROM deliveries WHERE 1=1';
    const params: any[] = [];

    if (date) {
      sql += ' AND delivery_date = ?';
      params.push(date);
    }
    if (gteDate) {
      sql += ' AND delivery_date >= ?';
      params.push(gteDate);
    }
    if (subId) {
      sql += ' AND subscription_id = ?';
      params.push(subId);
    }
    if (subIds) {
      const ids = subIds.split(',');
      sql += ` AND subscription_id IN (${ids.map(() => '?').join(',')})`;
      params.push(...ids);
    }

    sql += ' ORDER BY delivery_date DESC';
    const results = await mysql.query(sql, params);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Delivery GET Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await mysql.insert('deliveries', {
      subscription_id: data.subscription_id,
      delivery_date: data.delivery_date,
      quantity: data.quantity || 1,
      status: data.status || 'delivered'
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const subId = searchParams.get('subscription_id');
  const date = searchParams.get('date');

  try {
    if (id) {
      await mysql.remove('deliveries', 'id', id);
    } else if (subId && date) {
      await mysql.query('DELETE FROM deliveries WHERE subscription_id = ? AND delivery_date = ?', [subId, date]);
    } else {
      return NextResponse.json({ error: 'ID or subId+date required' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
