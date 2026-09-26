const fs = require('fs');
const content = fs.readFileSync('./src/lib/data.ts', 'utf-8');

// Match products array
const startIdx = content.indexOf('export const products = [');
if (startIdx !== -1) {
  const jsonPart = content.slice(startIdx);
  // parse product objects roughly
  const matches = [...content.matchAll(/{\s*id:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*category_id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*unit:\s*"([^"]*)",\s*price:\s*([0-9.]+),\s*original_price:\s*([0-9.]+),\s*image_url:\s*"([^"]+)"/g)];
  
  console.log(`Matched ${matches.length} products`);
  const sqlLines = matches.map(m => {
    const id = m[1];
    const category = m[2].replace(/'/g, "''");
    const category_id = m[3];
    const name = m[4].replace(/'/g, "''");
    const unit = m[5].replace(/'/g, "''");
    const price = m[6];
    const origPrice = m[7];
    const img = m[8];
    const imagesJson = JSON.stringify([img]).replace(/'/g, "''");

    return `INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('${id}', '${name}', '${category_id}', '${category}', 'Mobile', ${price}, ${origPrice}, 25, 'SKU-${id.toUpperCase()}', '${img}', '${imagesJson}'::jsonb, '${name} - Authentic premium brand original warranty.', '${unit}', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;`;
  });

  if (sqlLines.length > 0) {
    fs.appendFileSync('./supabase_schema.sql', '\n\n-- SEED PRODUCTS\n' + sqlLines.join('\n\n') + '\n');
    console.log('Successfully appended product seed data to supabase_schema.sql');
  }
}
