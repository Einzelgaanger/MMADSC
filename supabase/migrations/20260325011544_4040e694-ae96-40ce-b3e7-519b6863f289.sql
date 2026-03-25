
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  wallet_address text NOT NULL,
  paystack_customer_code text,
  paystack_subscription_code text,
  paystack_authorization_code text,
  plan text NOT NULL DEFAULT 'insider',
  status text NOT NULL DEFAULT 'active',
  amount_usd numeric NOT NULL DEFAULT 29.99,
  next_charge_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  cancelled_at timestamp with time zone
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert subscriptions" ON public.subscriptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can read own subscription by email" ON public.subscriptions FOR SELECT TO public USING (true);
CREATE POLICY "Service can update subscriptions" ON public.subscriptions FOR UPDATE TO public USING (true);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
