import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    // Sorting by id DESC instead of created_at just in case created_at is missing from the table
    const reviews = await mysql.query('SELECT * FROM reviews ORDER BY id DESC');
    console.log(`Fetched ${Array.isArray(reviews) ? (reviews as any[]).length : 0} reviews`);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('Reviews GET Error:', error);
    // Fallback: try without sorting if id DESC fails for some reason
    try {
      const fallbackReviews = await mysql.query('SELECT * FROM reviews');
      return NextResponse.json(fallbackReviews);
    } catch (innerError: any) {
      return NextResponse.json({ 
        error: 'Failed to fetch reviews', 
        details: error.message || String(error)
      }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = await mysql.insert('reviews', {
      customer_name: data.customer_name,
      rating: data.rating || 5,
      comment: data.comment,
      status: 'approved'
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Review Save Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await mysql.update('reviews', updateData, 'id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review Update Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await mysql.remove('reviews', 'id', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
