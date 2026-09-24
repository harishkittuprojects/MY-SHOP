-- Add quantity column to deliveries table
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS quantity NUMERIC;
