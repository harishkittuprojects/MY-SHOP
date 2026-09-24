import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing DB connection...');
    const result = await mysql.query('SELECT 1 as connected');
    return NextResponse.json({ 
      status: 'success', 
      message: 'Connected to MySQL successfully',
      result 
    });
  } catch (error) {
    console.error('DB Debug Error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to connect to MySQL',
      error: error instanceof Error ? error.message : String(error),
      host: process.env.DB_HOST,
      user: process.env.DB_USER
    }, { status: 500 });
  }
}
