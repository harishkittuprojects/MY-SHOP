import mysql from '../lib/mysql';

async function main() {
  try {
    const results = await mysql.query('DESCRIBE subscriptions');
    console.log('Subscriptions Table Schema:');
    console.table(results);
    process.exit(0);
  } catch (error) {
    console.error('Failed to describe table:', error);
    process.exit(1);
  }
}

main();
