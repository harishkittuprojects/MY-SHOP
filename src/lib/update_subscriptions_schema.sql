-- Update subscriptions table to include customer email
DO $$ 
BEGIN 
    BEGIN
        ALTER TABLE public.subscriptions ADD COLUMN customer_email TEXT;
    EXCEPTION WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
END $$;

-- Index for faster lookup by email
CREATE INDEX IF NOT EXISTS subscriptions_customer_email_idx ON public.subscriptions(customer_email);
