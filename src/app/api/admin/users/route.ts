import { NextResponse } from 'next/server';
import { AdminUsersDB } from '@/lib/db';

export async function GET() {
  try {
    const users = await AdminUsersDB.getAll();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Admin Users GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Super Admin';

    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const user = await AdminUsersDB.create(data, adminName);
    return NextResponse.json(user);
  } catch (error: any) {
    console.error('Admin Users POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create admin user' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const adminName = request.headers.get('x-admin-name') || 'Super Admin';
    const updated = await AdminUsersDB.update(id, updates, adminName);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Admin Users PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update admin user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  try {
    const adminName = request.headers.get('x-admin-name') || 'Super Admin';
    await AdminUsersDB.delete(id, adminName);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin Users DELETE Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete admin user' }, { status: 500 });
  }
}
