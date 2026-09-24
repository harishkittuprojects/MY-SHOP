
import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    const categories = await mysql.query('SELECT * FROM categories');
    const products = await mysql.query('SELECT COUNT(*) as count FROM products');
    const categoryCounts = await mysql.query(`
      SELECT c.name, COUNT(p.id) as product_count 
      FROM categories c 
      LEFT JOIN products p ON c.id = p.category_id 
      GROUP BY c.id
    `);

    return NextResponse.json({ 
      status: 'success', 
      categories,
      totalProducts: products[0]?.count,
      breakdown: categoryCounts
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
