import mysql from '../lib/mysql';

async function main() {
  try {
    const results = await mysql.query('SELECT name, count(*) as count FROM products GROUP BY name HAVING count > 1');
    console.log('Duplicate Products (by name):');
    console.table(results);
    
    const all = await mysql.query('SELECT id, name, category_id FROM products ORDER BY name');
    console.log('All Products:');
    console.table(all);
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to check products:', error);
    process.exit(1);
  }
}

main();
