import { NextResponse } from 'next/server';
import { AdminUsersDB, logActivity } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = await AdminUsersDB.verifyCredentials(email, password);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await logActivity({
      admin_name: admin.name,
      admin_id: admin.id,
      action: 'admin_login',
      entity_type: 'auth',
      details: { email: admin.email, role: admin.role }
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      }
    });
  } catch (error: any) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}
