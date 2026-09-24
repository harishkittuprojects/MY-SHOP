import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    const results = await mysql.query('SELECT * FROM settings');
    const settings: Record<string, any> = {};
    results.forEach((row: any) => {
      settings[row.key] = row.value;
    });
    
    // Fallbacks if table is empty
    return NextResponse.json({
      subscription_fee: settings.subscription_fee || "599",
      contact_email: settings.contact_email || "support@madur.in",
      contact_phone: settings.contact_phone || "+91 9345678910",
      delivery_charge: settings.delivery_charge || "0"
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Batch update settings
    for (const [key, value] of Object.entries(data)) {
      await mysql.query(
        'INSERT INTO settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, value, value]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

