const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function migrate() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });

  const connection = await mysql.createConnection({
    host: env.DB_HOST || 'localhost',
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
  });

  try {
    console.log('Starting migration...');

    // 1. Create or update 'Dry Fruits' category
    // Using UPDATE on existing or INSERT
    const [rows] = await connection.execute("SELECT id FROM categories WHERE name = ?", ['Dry Fruits']);
    let dryFruitCatId;
    
    if (rows.length === 0) {
      const [res] = await connection.execute(
        "INSERT INTO categories (name, icon, image_url) VALUES (?, ?, ?)",
        ['Dry Fruits', '🥜', '/categories/dry-fruits.png']
      );
      dryFruitCatId = res.insertId;
      console.log('Created new Dry Fruits category with ID:', dryFruitCatId);
    } else {
      dryFruitCatId = rows[0].id;
      await connection.execute(
        "UPDATE categories SET image_url = ?, icon = ? WHERE id = ?",
        ['/categories/dry-fruits.png', '🥜', dryFruitCatId]
      );
      console.log('Updated existing Dry Fruits category ID:', dryFruitCatId);
    }

    // 2. Update products
    const productsToMove = ['Dry Fruits Mix', 'Almonds', 'Cashews', 'Black Raisins', 'Golden Raisins'];
    const placeholders = productsToMove.map(() => '?').join(', ');
    const [prodResult] = await connection.execute(
      `UPDATE products SET category_id = ? WHERE name IN (${placeholders})`,
      [dryFruitCatId, ...productsToMove]
    );

    console.log(`Migration successful! Updated ${prodResult.affectedRows} products.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await connection.end();
  }
}

migrate();
