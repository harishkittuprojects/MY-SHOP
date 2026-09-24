-- Exclusive Mobile Store Database Schema & Seed Data

-- 1. Insert Smartphone Categories
INSERT INTO categories (id, name, image_url) VALUES 
('samsung-galaxy', 'Samsung Galaxy', '/products/samsung-galaxy-s25-ultra.png'),
('apple-iphone', 'Apple iPhone', '/products/iphone-16-pro-max.png'),
('google-pixel', 'Google Pixel', '/products/google-pixel-9-pro-xl.png')
ON DUPLICATE KEY UPDATE name=VALUES(name), image_url=VALUES(image_url);

-- 2. Insert Exclusively Verified Mobile Products
INSERT INTO products (name, category_id, price, original_price, unit, image_url, description, is_available, is_popular) VALUES 
('Samsung Galaxy S25 Ultra 5G', 'samsung-galaxy', 129999, 139999, '12GB+512GB • Titanium Silver', '/products/samsung-galaxy-s25-ultra.png', 'Snapdragon 8 Elite, 200MP Quad Telephoto AI Camera, Built-in S-Pen, Anti-reflective Gorilla Armor glass with Galaxy AI.', 1, 1),
('iPhone 16 Pro Max', 'apple-iphone', 139999, 144900, '256GB • Desert Titanium', '/products/iphone-16-pro-max.png', 'A18 Pro chip with 6-core GPU, 48MP Fusion Camera, Camera Control button, Grade 5 Titanium design with 6.9-inch Super Retina XDR display.', 1, 1),
('Google Pixel 9 Pro XL 5G', 'google-pixel', 104999, 114999, '16GB+256GB • Obsidian Black', '/products/google-pixel-9-pro-xl.png', 'Google Tensor G4 with Gemini AI Advanced, 6.8-inch Super Actua 120Hz display, 5x Telephoto zoom with 7 years of OS updates.', 1, 1),
('Google Pixel 9 5G', 'google-pixel', 69999, 79999, '12GB+128GB • Porcelain White', '/products/google-pixel-9.png', '6.3-inch Actua display, 50MP Main camera + 48MP Ultrawide with Macro Focus, Magic Eraser and Best Take AI.', 1, 1);
