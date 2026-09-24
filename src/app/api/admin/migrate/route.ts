import { NextResponse } from 'next/server';
import mysql from '@/lib/mysql';

export async function GET() {
  try {
    console.log('Starting migration via API...');

    // 1. Create or update 'Dry Fruits' category
    const categories: any[] = await mysql.query("SELECT id FROM categories WHERE name = ?", ['Dry Fruits']);
    let dryFruitCatId;
    
    if (categories.length === 0) {
      await mysql.query(
        "INSERT INTO categories (name, icon, image_url) VALUES (?, ?, ?)",
        ['Dry Fruits', '🥜', '/categories/dry-fruits.png']
      );
      const newCats: any[] = await mysql.query("SELECT id FROM categories WHERE name = ?", ['Dry Fruits']);
      dryFruitCatId = newCats[0].id;
      console.log('Created new Dry Fruits category with ID:', dryFruitCatId);
    } else {
      dryFruitCatId = categories[0].id;
      await mysql.query(
        "UPDATE categories SET image_url = ?, icon = ? WHERE id = ?",
        ['/categories/dry-fruits.png', '🥜', dryFruitCatId]
      );
      console.log('Updated existing Dry Fruits category ID:', dryFruitCatId);
    }

    // 2. Move products
    const productsToMove = ['Dry Fruits Mix', 'Almonds', 'Cashews', 'Black Raisins', 'Golden Raisins'];
    const placeholders = productsToMove.map(() => '?').join(', ');
    const updateResult: any = await mysql.query(
      `UPDATE products SET category_id = ? WHERE name IN (${placeholders})`,
      [dryFruitCatId, ...productsToMove]
    );

    console.log(`Migration successful! Updated products.`);

    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed', 
      updatedProducts: updateResult.affectedRows || 'count N/A' 
    });
  } catch (err: any) {
    console.error('Migration API failed:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
