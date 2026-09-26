import { NextResponse } from 'next/server';
import { CouponsDB } from '@/lib/db';

export async function GET() {
  try {
    const coupons = await CouponsDB.getAll();
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error('Coupons GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const coupon = await CouponsDB.create(data, adminName);
    return NextResponse.json(coupon);
  } catch (error: any) {
    console.error('Coupons POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });

    const adminName = request.headers.get('x-admin-name') || 'Admin';
    const updated = await CouponsDB.update(id, updates, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Coupons PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });

  try {
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    await CouponsDB.delete(id, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Coupons DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete coupon' }, { status: 500 });
  }
}
