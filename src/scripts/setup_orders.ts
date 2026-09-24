import mysql from '../lib/mysql';

async function main() {
  try {
    console.log('Starting Orders table setup...');
    
    // 1. Create orders table
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
    console.log('Orders table created/verified.');

    // 2. Add columns if needed
    try {
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`);
      await mysql.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS location_link TEXT`);
      console.log('Columns verified.');
    } catch (e) {
      console.log('Some columns already exist.');
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
    console.log('Order items table created/verified.');
    
    console.log('Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();
