import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, email, subscriptionCode } = await req.json();
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!PAYSTACK_SECRET_KEY) throw new Error('PAYSTACK_SECRET_KEY not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (action === 'check') {
      // Check subscription status by email
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!subs || subs.length === 0) {
        return new Response(JSON.stringify({ active: false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ active: true, subscription: subs[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cancel') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Find active subscription
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!subs || subs.length === 0) {
        return new Response(JSON.stringify({ error: 'No active subscription found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sub = subs[0];

      // Cancel on Paystack if subscription code exists
      if (sub.paystack_subscription_code) {
        try {
          const cancelRes = await fetch('https://api.paystack.co/subscription/disable', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: sub.paystack_subscription_code,
              token: sub.paystack_authorization_code,
            }),
          });
          const cancelData = await cancelRes.json();
          console.log('Paystack cancel response:', cancelData);
        } catch (e) {
          console.error('Paystack cancel error:', e);
        }
      }

      // Update local DB
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', sub.id);

      return new Response(JSON.stringify({ success: true, message: 'Subscription cancelled successfully' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Subscription management error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
