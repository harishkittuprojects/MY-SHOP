import mysql from './src/lib/mysql';

async function check() {
  try {
    const categories = await mysql.query('SELECT * FROM categories');
    console.log('Categories:', JSON.stringify(categories, null, 2));
    
    const products = await mysql.query('SELECT p.id, p.name, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id');
    console.log('Products:', JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

check();
