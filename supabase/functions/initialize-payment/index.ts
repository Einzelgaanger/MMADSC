import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const tierPricing: Record<string, { amount: number; label: string }> = {
  basic: { amount: 999, label: "MetaDrop Basic Report" },
  pro: { amount: 4999, label: "MetaDrop Pro Report" },
  elite: { amount: 9999, label: "MetaDrop Elite Report" },
  insider: { amount: 2999, label: "MetaDrop Insider Weekly (Monthly)" },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, walletAddress, tier = "pro", amount } = await req.json();

    if (!email || !walletAddress) {
      return new Response(JSON.stringify({ error: 'Email and wallet address are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const pricing = tierPricing[tier] || tierPricing.pro;
    const finalAmount = amount || pricing.amount;

    const body: any = {
      email,
      amount: finalAmount,
      currency: 'USD',
      metadata: {
        wallet_address: walletAddress,
        product: pricing.label,
        tier,
      },
    };

    // For insider (subscription), use Paystack plan if available
    // Otherwise treat as one-time for now
    if (tier === 'insider') {
      body.metadata.subscription = true;
    }

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const paystackRes = await response.json();

    if (!paystackRes.status) {
      console.error('Paystack initialization failed:', paystackRes);
      return new Response(JSON.stringify({ error: 'Payment initialization failed', details: paystackRes.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      authorization_url: paystackRes.data.authorization_url,
      access_code: paystackRes.data.access_code,
      reference: paystackRes.data.reference,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error initializing payment:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
