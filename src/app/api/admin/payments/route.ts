import { NextResponse } from 'next/server';
import { PaymentsDB } from '@/lib/db';

export async function GET() {
  try {
    const payments = await PaymentsDB.getAll();
    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('Payments GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, payment_status } = data;
    const adminName = request.headers.get('x-admin-name') || 'Admin';

    if (!id || !payment_status) {
      return NextResponse.json({ error: 'ID and payment_status required' }, { status: 400 });
    }

    const updated = await PaymentsDB.updateStatus(id, payment_status, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Payments PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update payment' }, { status: 500 });
  }
}
