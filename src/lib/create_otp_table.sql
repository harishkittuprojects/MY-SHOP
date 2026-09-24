-- Create OTP table for custom authentication
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster cleanup and lookup
CREATE INDEX IF NOT EXISTS otps_email_idx ON public.otps(email);

-- Disable RLS to allow our Backend Actions to manage OTPs
ALTER TABLE public.otps DISABLE ROW LEVEL SECURITY;
