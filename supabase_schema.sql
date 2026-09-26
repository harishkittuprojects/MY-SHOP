-- ==============================================================================
-- SUPABASE COMPLETE E-COMMERCE DATABASE SCHEMA & SEED DATA
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor and click RUN
-- ==============================================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT '📱',
    image_url TEXT,
    sub_categories JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(100) REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    sub_category VARCHAR(100),
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    stock_quantity INT DEFAULT 10,
    sku VARCHAR(100),
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    unit VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 4.8,
    reviews_count INT DEFAULT 0,
    variants JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMERS / USERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    full_name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(100) PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    delivery_fee DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVENTORY & STOCK LOGS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(100) REFERENCES public.products(id) ON DELETE CASCADE,
    product_name VARCHAR(255),
    change_type VARCHAR(50) NOT NULL, -- 'order_deduct', 'order_cancel_restore', 'manual_adjustment', 'restock'
    previous_stock INT NOT NULL,
    change_amount INT NOT NULL,
    new_stock INT NOT NULL,
    reason TEXT,
    admin_name VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COUPONS / OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(10, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(10, 2),
    start_date DATE,
    end_date DATE,
    usage_limit INT,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HERO & HOMEPAGE BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255),
    subtitle VARCHAR(255),
    tag VARCHAR(100),
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    link_url VARCHAR(255) DEFAULT '/products',
    button_text VARCHAR(100) DEFAULT 'Shop Now',
    banner_type VARCHAR(50) DEFAULT 'hero', -- 'hero', 'promo_top', 'promo_mid', 'promo_bottom'
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(100) REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_name VARCHAR(255),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    gateway_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin', -- 'superadmin', 'admin', 'manager'
    permissions JSONB DEFAULT '["products", "orders", "customers", "inventory", "reports", "coupons", "settings", "banners", "gallery", "logs"]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ACTIVITY / AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
    admin_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'create_product', 'update_order', 'delete_category', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'order', 'category', 'coupon', 'setting'
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MEDIA / GALLERY TABLE (CLOUDINARY)
CREATE TABLE IF NOT EXISTS public.media_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id VARCHAR(255) UNIQUE,
    url TEXT NOT NULL,
    secure_url TEXT NOT NULL,
    format VARCHAR(20),
    resource_type VARCHAR(50) DEFAULT 'image', -- 'image' or 'raw' (for pdf)
    bytes INT,
    width INT,
    height INT,
    folder VARCHAR(100) DEFAULT 'myshop',
    alt_text VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DISABLE ROW LEVEL SECURITY (RLS) FOR INITIAL ACCESS / ENABLE PERMISSIVE POLICIES
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;

-- Allow full public read/write via anon key for standard application workflow
CREATE POLICY "Allow all on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inventory_logs" ON public.inventory_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on coupons" ON public.coupons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on activity_logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on media_gallery" ON public.media_gallery FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA
-- ==============================================================================

-- Default Super Admin User (Password: admin123)
INSERT INTO public.admin_users (name, email, password_hash, role, permissions, is_active)
VALUES (
    'Super Admin', 
    'admin@example.com', 
    'admin123', 
    'superadmin', 
    '["products", "categories", "orders", "customers", "inventory", "reports", "coupons", "settings", "banners", "gallery", "logs", "users"]'::jsonb, 
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Default Settings
INSERT INTO public.site_settings (key, value, category, description) VALUES
('store_name', 'MY SHOP', 'general', 'Store Brand Name'),
('contact_email', 'support@myshop.com', 'general', 'Customer Support Email'),
('contact_phone', '+91 9876543210', 'general', 'Contact Phone Number'),
('whatsapp_number', '+91 9876543210', 'general', 'WhatsApp Support Number'),
('store_address', '123 Tech Park, Electronics City, Bengaluru, Karnataka 560100', 'general', 'Store Physical Address'),
('delivery_fee', '49', 'delivery', 'Standard Delivery Fee in INR'),
('free_delivery_threshold', '999', 'delivery', 'Minimum Order Amount for Free Delivery'),
('tax_rate', '18', 'payment', 'Default GST/Tax percentage'),
('currency_symbol', '₹', 'general', 'Currency Symbol'),
('announcement_text', '🚀 Mega Festival Sale: Flat 20% OFF on all 5G Smartphones! Use code: FESTIVAL20', 'announcement', 'Top bar streaming announcement'),
('enable_cod', 'true', 'payment', 'Enable Cash on Delivery'),
('enable_online_payment', 'true', 'payment', 'Enable Online Payment (Razorpay/UPI)')
ON CONFLICT (key) DO NOTHING;

-- Default Categories
INSERT INTO public.categories (id, name, icon, image_url, sub_categories, is_active, display_order) VALUES
('mobiles-accessories', 'Mobiles & Accessories', '📱', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600', '["Mobile", "Chargers", "Storage", "Adapters", "Tempered Glass", "Power Bank", "Case & Covers"]'::jsonb, true, 1),
('computers-tablets', 'Computers & Tablets', '💻', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600', '["Laptops", "Tablets", "Keyboards", "Monitors", "Mice"]'::jsonb, true, 2),
('tv-audio', 'TV & Audio', '📺', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600', '["Smart TVs", "Soundbars", "Earbuds", "Headphones"]'::jsonb, true, 3),
('kitchen-appliances', 'Kitchen Appliances', '🍳', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', '["Microwaves", "Blenders", "Air Fryers", "Coffee Makers"]'::jsonb, true, 4),
('home-appliances', 'Home Appliances', '🏠', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600', '["Air Conditioners", "Refrigerators", "Washing Machines", "Vacuum Cleaners"]'::jsonb, true, 5),
('smart-technology', 'Smart Technology', '💡', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600', '["Smartwatches", "Smart Bulbs", "Security Cameras", "Voice Assistants"]'::jsonb, true, 6)
ON CONFLICT (id) DO NOTHING;

-- Default Hero Slides
INSERT INTO public.hero_slides (title, subtitle, tag, image_url, link_url, button_text, banner_type, display_order, is_active) VALUES
('Apple iPhone 16 Pro Max', 'Titanium Design • A18 Pro Chip • 48MP Fusion Camera', 'Special Launch Offer', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=1200', '/products', 'Explore Offers', 'hero', 1, true),
('Samsung Galaxy S24 Ultra', 'Galaxy AI is Here • 200MP Camera • 100x Space Zoom', 'Best Flagship 2026', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=1200', '/products', 'Buy Now', 'hero', 2, true),
('OnePlus 12 5G Flagship', 'Snapdragon 8 Gen 3 • Hasselblad Camera • 100W SuperVOOC', 'Trending Deal', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=1200', '/products', 'Grab Deal', 'hero', 3, true);

-- Default Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, start_date, end_date, is_active) VALUES
('WELCOME10', 'percentage', 10, 500, 200, CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', true),
('FESTIVAL20', 'percentage', 20, 1999, 1000, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('FLAT500', 'fixed', 500, 4999, 500, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true);


-- SEED PRODUCTS
INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('iphone-13-starlight', 'Apple iPhone 13 ( Starlight,128GB )', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 49900, 59900, 25, 'SKU-IPHONE-13-STARLIGHT', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Apple iPhone 13 ( Starlight,128GB ) - Authentic premium brand original warranty.', '128GB • Starlight • A15 Bionic • 12MP Dual Camera', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('vivo-y400-5g', 'Vivo Y400 5G ( Olive Green, 8GB-128GB )', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 31999, 35999, 25, 'SKU-VIVO-Y400-5G', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Vivo Y400 5G ( Olive Green, 8GB-128GB ) - Authentic premium brand original warranty.', '8GB RAM | 128GB ROM • 50MP Sony HD Cam • 5000mAh 44W', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('iphone-13-midnight', 'Apple iPhone 13 ( Midnight,128GB )', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 49900, 59900, 25, 'SKU-IPHONE-13-MIDNIGHT', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Apple iPhone 13 ( Midnight,128GB ) - Authentic premium brand original warranty.', '128GB • Midnight Black • A15 Bionic • Super Retina XDR', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('iphone-13-blue', 'Apple iPhone 13 (Blue,128GB)', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 49900, 59900, 25, 'SKU-IPHONE-13-BLUE', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Apple iPhone 13 (Blue,128GB) - Authentic premium brand original warranty.', '128GB • Vibrant Blue • Dual 12MP System • iOS 18 Ready', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('iphone-13-pink', 'Apple iPhone 13 ( Pink,128GB )', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 49900, 59900, 25, 'SKU-IPHONE-13-PINK', 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Apple iPhone 13 ( Pink,128GB ) - Authentic premium brand original warranty.', '128GB • Pastel Pink • Ceramic Shield • MagSafe Compatible', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('samsung-s25-ultra', 'Samsung Galaxy S25 Ultra 5G (Titanium Silverblue, 256 GB, 12 GB RAM)', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 129999, 139999, 25, 'SKU-SAMSUNG-S25-ULTRA', '/products/samsung-galaxy-s25-ultra.png', '["/products/samsung-galaxy-s25-ultra.png"]'::jsonb, 'Samsung Galaxy S25 Ultra 5G (Titanium Silverblue, 256 GB, 12 GB RAM) - Authentic premium brand original warranty.', '12GB RAM | 256GB ROM • Snapdragon 8 Elite • 200MP Quad AI', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('oneplus-13', 'OnePlus 13 5G (Midnight Ocean, 512 GB, 16 GB RAM)', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 69999, 74999, 25, 'SKU-ONEPLUS-13', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'OnePlus 13 5G (Midnight Ocean, 512 GB, 16 GB RAM) - Authentic premium brand original warranty.', '16GB RAM | 512GB ROM • Snapdragon 8 Elite • 6000mAh 100W', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('pixel-9-pro-xl', 'Google Pixel 9 Pro XL 5G (Hazel Green, 256 GB, 16 GB RAM)', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 104999, 114999, 25, 'SKU-PIXEL-9-PRO-XL', '/products/google-pixel-9-pro-xl.png', '["/products/google-pixel-9-pro-xl.png"]'::jsonb, 'Google Pixel 9 Pro XL 5G (Hazel Green, 256 GB, 16 GB RAM) - Authentic premium brand original warranty.', '16GB RAM | 256GB ROM • Google Tensor G4 • Gemini Advanced AI', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('iphone-16', 'Apple iPhone 16 (Ultramarine Blue, 128 GB)', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 74999, 79900, 25, 'SKU-IPHONE-16', '/products/iphone-16-pro-max.png', '["/products/iphone-16-pro-max.png"]'::jsonb, 'Apple iPhone 16 (Ultramarine Blue, 128 GB) - Authentic premium brand original warranty.', '128GB / 256GB • A18 Bionic • 48MP 2-in-1 Fusion Camera', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('apple-20w-charger', 'Apple 20W USB-C Fast Power Adapter & Type-C Cable Combo', 'mobiles-accessories', 'Mobiles & Accessories', 'Mobile', 1899, 2199, 25, 'SKU-APPLE-20W-CHARGER', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Apple 20W USB-C Fast Power Adapter & Type-C Cable Combo - Authentic premium brand original warranty.', '20W PD Fast Charging • Official Apple Genuine Accessory', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('asus-tuf-gaming-f15', 'ASUS TUF Gaming F15 (16 GB RAM, 512 GB SSD, RTX 4060, Intel i7-13th Gen)', 'computers-tablets', 'Computers & Tablets', 'Mobile', 84990, 104990, 25, 'SKU-ASUS-TUF-GAMING-F15', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'ASUS TUF Gaming F15 (16 GB RAM, 512 GB SSD, RTX 4060, Intel i7-13th Gen) - Authentic premium brand original warranty.', '16GB DDR5 | 512GB Gen4 SSD • RTX 4060 8GB • 144Hz FHD', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('sony-wh-1000xm5', 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones', 'tv-audio', 'TV & Audio', 'Mobile', 26990, 34990, 25, 'SKU-SONY-WH-1000XM5', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones - Authentic premium brand original warranty.', 'Auto NC Optimizer • 30h Battery with Quick Charge • Hi-Res LDAC', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('elgi-ultra-wet-grinder', 'Elgi Ultra Dura+ 1.25 Litre Table Top Wet Grinder with Conical Stones', 'kitchen-appliances', 'Kitchen Appliances', 'Mobile', 7490, 8990, 25, 'SKU-ELGI-ULTRA-WET-GRINDER', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Elgi Ultra Dura+ 1.25 Litre Table Top Wet Grinder with Conical Stones - Authentic premium brand original warranty.', '1.25L Capacity • Patented Conical Stones • AISI 304 Stainless Steel', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('preethi-zodiac-mixer-grinder', 'Preethi Zodiac MG-218 750-Watt Mixer Grinder with 5 Jars (Food Processor)', 'kitchen-appliances', 'Kitchen Appliances', 'Mobile', 8999, 11499, 25, 'SKU-PREETHI-ZODIAC-MIXER-GRINDER', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Preethi Zodiac MG-218 750-Watt Mixer Grinder with 5 Jars (Food Processor) - Authentic premium brand original warranty.', '750W Vega W5 Motor • 5 Multi-Utility Jars • Kneading in 1 Min', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('philips-digital-air-fryer', 'Philips Digital Air Fryer HD9252/90 with Rapid Air Technology (4.1 Litre)', 'kitchen-appliances', 'Kitchen Appliances', 'Mobile', 6999, 11995, 25, 'SKU-PHILIPS-DIGITAL-AIR-FRYER', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Philips Digital Air Fryer HD9252/90 with Rapid Air Technology (4.1 Litre) - Authentic premium brand original warranty.', '4.1L Capacity • 1400W • 90% Less Fat Rapid Air Tech', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('lg-260l-refrigerator', 'LG 260 Litres 3 Star Smart Inverter Double Door Refrigerator', 'home-appliances', 'Home Appliances', 'Mobile', 25990, 33990, 25, 'SKU-LG-260L-REFRIGERATOR', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'LG 260 Litres 3 Star Smart Inverter Double Door Refrigerator - Authentic premium brand original warranty.', '260L Double Door • Smart Inverter Compressor • Multi Air Flow', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('samsung-8kg-washing-machine', 'Samsung 8 kg 5 Star EcoBubble Fully-Automatic Front Load Washing Machine', 'home-appliances', 'Home Appliances', 'Mobile', 34990, 45990, 25, 'SKU-SAMSUNG-8KG-WASHING-MACHINE', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Samsung 8 kg 5 Star EcoBubble Fully-Automatic Front Load Washing Machine - Authentic premium brand original warranty.', '8 kg Front Load • EcoBubble AI • Hygiene Steam • 1400 RPM', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('daikin-1-5-ton-3-star-inverter-ac', 'Daikin 1.5 Ton 3 Star Inverter Split Air Conditioner (PM 2.5 Filter)', 'home-appliances', 'Home Appliances', 'Mobile', 37990, 52990, 25, 'SKU-DAIKIN-1-5-TON-3-STAR-INVERTER-AC', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Daikin 1.5 Ton 3 Star Inverter Split Air Conditioner (PM 2.5 Filter) - Authentic premium brand original warranty.', '1.5 Ton • 3 Star Inverter • 100% Copper Condenser • PM 2.5 Filter', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('apple-watch-series-10', 'Apple Watch Series 10 GPS (Jet Black Aluminium, 46mm Sport Band)', 'smart-technology', 'Smart Technology', 'Mobile', 46900, 49900, 25, 'SKU-APPLE-WATCH-SERIES-10', '/products/google-pixel-9.png', '["/products/google-pixel-9.png"]'::jsonb, 'Apple Watch Series 10 GPS (Jet Black Aluminium, 46mm Sport Band) - Authentic premium brand original warranty.', '46mm OLED • S10 SiP • ECG & Sleep Apnea • Fast Charge', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('samsung-galaxy-watch-ultra', 'Samsung Galaxy Watch Ultra LTE (Titanium Gray, 47mm Marine Band)', 'smart-technology', 'Smart Technology', 'Mobile', 59999, 64999, 25, 'SKU-SAMSUNG-GALAXY-WATCH-ULTRA', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Samsung Galaxy Watch Ultra LTE (Titanium Gray, 47mm Marine Band) - Authentic premium brand original warranty.', '47mm Grade 4 Titanium • Dual-Frequency GPS • 100m Water Resistant', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('tp-link-tapo-smart-security-camera', 'TP-Link Tapo C210 2K 3MP Pan/Tilt Smart AI Home Security Wi-Fi Camera', 'smart-technology', 'Smart Technology', 'Mobile', 2199, 3999, 25, 'SKU-TP-LINK-TAPO-SMART-SECURITY-CAMERA', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'TP-Link Tapo C210 2K 3MP Pan/Tilt Smart AI Home Security Wi-Fi Camera - Authentic premium brand original warranty.', '2K 3MP Resolution • 360° Pan/Tilt • Night Vision • Two-Way Audio', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, name, category_id, category_name, sub_category, price, original_price, stock_quantity, sku, image_url, images, description, unit, is_available, is_featured, is_popular, rating, reviews_count)
VALUES ('wipro-smart-led-bulb-12w', 'Wipro Next 12W B22 Smart LED Color Bulb with Voice Control (Pack of 2)', 'smart-technology', 'Smart Technology', 'Mobile', 1199, 2490, 25, 'SKU-WIPRO-SMART-LED-BULB-12W', 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=600', '["https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=600"]'::jsonb, 'Wipro Next 12W B22 Smart LED Color Bulb with Voice Control (Pack of 2) - Authentic premium brand original warranty.', '12W B22 • 16 Million Colors • Works with Alexa & Google Assistant', true, true, true, 4.8, 45)
ON CONFLICT (id) DO NOTHING;
