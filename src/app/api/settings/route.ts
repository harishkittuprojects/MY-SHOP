import { NextResponse } from 'next/server';
import { SiteSettingsDB } from '@/lib/db';

export async function GET() {
  try {
    const settings = await SiteSettingsDB.getAll();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Settings GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const adminName = request.headers.get('x-admin-name') || 'Admin';
    await SiteSettingsDB.updateMany(data, adminName);
    const updated = await SiteSettingsDB.getAll();
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Settings POST Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
