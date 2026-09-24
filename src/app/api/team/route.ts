import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    const members = await mysql.query('SELECT * FROM team_members ORDER BY is_founder DESC, display_order ASC');
    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data.id) {
       // Update
       await mysql.update('team_members', {
         name: data.name,
         role: data.role,
         bio: data.bio,
         image_url: data.image_url,
         is_founder: data.is_founder || false,
         display_order: data.display_order || 0
       }, 'id', data.id);
       return NextResponse.json({ success: true });
    } else {
       // Insert
       const result = await mysql.insert('team_members', {
         name: data.name,
         role: data.role,
         bio: data.bio,
         image_url: data.image_url,
         is_founder: data.is_founder || false,
         display_order: data.display_order || 0
       });
       return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Team Member Save Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await mysql.remove('team_members', 'id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
