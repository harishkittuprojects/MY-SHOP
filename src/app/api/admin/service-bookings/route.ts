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
    console.error('Admin service bookings GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, status, admin_notes } = data;
    const adminName = request.headers.get('x-admin-name') || 'Admin';

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const updated = await ServiceBookingsDB.updateStatus(id, status, admin_notes, adminName);
    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    console.error('Admin service bookings PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update booking status' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const adminName = request.headers.get('x-admin-name') || 'Admin';

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  try {
    await ServiceBookingsDB.delete(id, adminName);
    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete booking' }, { status: 500 });
  }
}
