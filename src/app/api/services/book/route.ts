import { NextResponse } from 'next/server';
import { ServiceBookingsDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const bookings = await ServiceBookingsDB.getAll({ search, status });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Service bookings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.customer_name || !data.customer_phone || !data.device_model) {
      return NextResponse.json(
        { error: 'Customer name, phone number, and device model are required' },
        { status: 400 }
      );
    }

    const booking = await ServiceBookingsDB.create({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email || '',
      address: data.address || '',
      city: data.city || 'Tech City',
      pincode: data.pincode || '',
      device_brand: data.device_brand || 'Smartphone',
      device_model: data.device_model,
      screen_type: data.screen_type || 'Original OLED Display',
      estimated_price: Number(data.estimated_price) || 2499,
      preferred_date: data.preferred_date || new Date().toISOString().split('T')[0],
      preferred_time: data.preferred_time || '10:00 AM - 01:00 PM',
      notes: data.notes || '',
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Mobile display service booked successfully!'
    });
  } catch (error: any) {
    console.error('Service bookings POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit service booking' }, { status: 500 });
  }
}
