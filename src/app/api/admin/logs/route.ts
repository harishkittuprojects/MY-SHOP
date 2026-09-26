import { NextResponse } from 'next/server';
import { ActivityLogsDB } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

  try {
    const logs = await ActivityLogsDB.getAll(limit);
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error('Logs API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch logs' }, { status: 500 });
  }
}
