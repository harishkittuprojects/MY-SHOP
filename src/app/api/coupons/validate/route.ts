import { NextResponse } from 'next/server';
import { CouponsDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code' }, { status: 400 });
    }

    const result = await CouponsDB.validateCoupon(code, Number(subtotal) || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, message: 'Error validating coupon' }, { status: 500 });
  }
}
