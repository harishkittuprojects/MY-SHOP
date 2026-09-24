-- Ensure all subscription fields are present
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS location_link TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS amount_paid NUMERIC;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS quantity NUMERIC;
