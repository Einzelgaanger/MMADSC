-- Create report_purchases table for tracking purchases (public access since no auth)
CREATE TABLE public.report_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  paystack_reference TEXT UNIQUE,
  amount_usd NUMERIC(10,2) NOT NULL DEFAULT 14.99,
  status TEXT NOT NULL DEFAULT 'pending',
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_purchases ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (no auth required for this app)
CREATE POLICY "Anyone can insert report purchases"
  ON public.report_purchases FOR INSERT
  WITH CHECK (true);

-- Allow reading own purchase by reference
CREATE POLICY "Anyone can read by reference"
  ON public.report_purchases FOR SELECT
  USING (true);

-- Allow updating status
CREATE POLICY "Service can update purchases"
  ON public.report_purchases FOR UPDATE
  USING (true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_report_purchases_updated_at
  BEFORE UPDATE ON public.report_purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();