import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // For Insider tier, create a Paystack subscription plan
    if (tier === 'insider') {
      // First, create or get the plan
      let planCode: string | null = null;

      // Check if plan exists
      const plansRes = await fetch('https://api.paystack.co/plan', {
        headers: { 'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}` },
      });
      const plansData = await plansRes.json();
      const existingPlan = plansData.data?.find((p: any) => p.name === 'MetaDrop Insider Weekly');

      if (existingPlan) {
        planCode = existingPlan.plan_code;
      } else {
        // Create the plan
        const createPlanRes = await fetch('https://api.paystack.co/plan', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'MetaDrop Insider Weekly',
            amount: finalAmount,
            interval: 'monthly',
            currency: 'USD',
            description: 'Weekly AI-powered wallet analysis reports with airdrop intelligence',
          }),
        });
        const createPlanData = await createPlanRes.json();
        if (createPlanData.status) {
          planCode = createPlanData.data.plan_code;
        }
      }

      // Initialize transaction with plan
      const body: any = {
        email,
        amount: finalAmount,
        currency: 'USD',
        plan: planCode,
        metadata: {
          wallet_address: walletAddress,
          product: pricing.label,
          tier: 'insider',
          subscription: true,
        },
      };

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

      // Store subscription record
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('subscriptions').insert({
        email,
        wallet_address: walletAddress,
        plan: 'insider',
        status: 'pending',
        amount_usd: 29.99,
      });

      return new Response(JSON.stringify({
        authorization_url: paystackRes.data.authorization_url,
        access_code: paystackRes.data.access_code,
        reference: paystackRes.data.reference,
        subscription: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // One-time payment for basic/pro/elite
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
