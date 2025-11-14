import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_ENVIRONMENT = Deno.env.get('PAYPAL_ENVIRONMENT') || 'sandbox';
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    const PAYPAL_API = PAYPAL_ENVIRONMENT === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const { courseSlug, courseTitle, price, voucherCode, email, name } = await req.json();

    console.log('Creating PayPal order:', { courseSlug, courseTitle, price, email });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get PayPal access token
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const tokenResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get PayPal access token');
    }

    const { access_token } = await tokenResponse.json();

    // Create payment intent record
    const { data: paymentIntent, error: intentError } = await supabaseClient
      .from('payment_intents')
      .insert({
        customer_email: email,
        customer_name: name,
        course_slug: courseSlug,
        course_title: courseTitle,
        original_price: price,
        final_price: price,
        voucher_code: voucherCode,
        payment_method: 'paypal',
        payment_status: 'pending',
        metadata: { voucherCode }
      })
      .select()
      .single();

    if (intentError) {
      console.error('Error creating payment intent:', intentError);
      throw intentError;
    }

    // Create PayPal order
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: paymentIntent.id,
        description: courseTitle,
        amount: {
          currency_code: 'GBP',
          value: price.toFixed(2)
        }
      }],
      application_context: {
        brand_name: 'Titans Careers',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/supabase', '')}/payment-success?payment_intent=${paymentIntent.id}&method=paypal`,
        cancel_url: `${Deno.env.get('VITE_SUPABASE_URL')?.replace('/supabase', '')}/courses?payment=cancelled`
      }
    };

    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order creation failed:', error);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();
    console.log('PayPal order created:', order.id);

    // Update payment intent with PayPal order ID
    await supabaseClient
      .from('payment_intents')
      .update({ provider_session_id: order.id })
      .eq('id', paymentIntent.id);

    // Get approval URL
    const approvalUrl = order.links.find((link: any) => link.rel === 'approve')?.href;

    return new Response(
      JSON.stringify({ 
        success: true, 
        approvalUrl,
        paymentIntentId: paymentIntent.id,
        orderId: order.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-paypal-order:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});