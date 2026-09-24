import { NextResponse } from "next/server";
import mysql from "@/lib/mysql";

export async function GET() {
  try {
    // 1. Create orders table if it doesn't exist
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255),
        customer_name VARCHAR(255),
        customer_phone VARCHAR(20),
        customer_email VARCHAR(255),
        shipping_address TEXT,
        location_link TEXT,
        total_amount DECIMAL(10, 2),
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Add columns if table already existed but was old
    try {
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_link TEXT`);
    } catch (e) {
      // Ignore errors if columns already exist
    }

    // 3. Create order_items table
    await mysql.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        product_id INT,
        quantity INT,
        price DECIMAL(10, 2),
        unit VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // 4. Update Subscriptions table schema (Self-healing)
    try {
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS location_link TEXT`);
      await mysql.query(`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS street VARCHAR(255)`);
      console.log('Subscriptions columns verified.');
    } catch (e) {
      // Ignore errors if columns already exist or table missing (unlikely)
    }
    
    return NextResponse.json({ success: true, message: "Orders and Subscriptions schema setup successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
