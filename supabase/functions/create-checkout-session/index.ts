import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseSlug, courseTitle, price, voucherCode, userEmail } = await req.json();

    if (!courseSlug || !courseTitle || !price) {
      throw new Error('Missing required fields: courseSlug, courseTitle, or price');
    }

    let stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || Deno.env.get('SECRETE_KEY');
    if (!stripeKey) {
      console.error('Available env vars:', Deno.env.toObject());
      throw new Error('Stripe secret key not configured (checked STRIPE_SECRET_KEY and SECRETE_KEY)');
    }
    stripeKey = stripeKey.trim();

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Creating checkout session for:', { courseSlug, courseTitle, price, voucherCode });

    // Validate and apply voucher if provided
    let finalPrice = price;
    let discountAmount = 0;
    let voucherData = null;

    if (voucherCode) {
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.81.1');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (voucher && !voucherError) {
        const now = new Date();
        const validFrom = new Date(voucher.valid_from);
        const validUntil = new Date(voucher.valid_until);

        if (now >= validFrom && now <= validUntil) {
          // Check usage limits
          const withinUsageLimit = !voucher.usage_limit || voucher.usage_count < voucher.usage_limit;

          let withinPerUserLimit = true;
          if (voucher.per_user_limit && userEmail) {
            const { count } = await supabase
              .from('voucher_usage')
              .select('*', { count: 'exact', head: true })
              .eq('voucher_id', voucher.id)
              .eq('user_email', userEmail);
            withinPerUserLimit = !count || count < voucher.per_user_limit;
          }

          // Check applicable courses
          const courseApplicable = !voucher.applicable_courses ||
            voucher.applicable_courses.length === 0 ||
            voucher.applicable_courses.includes(courseSlug);

          // Check minimum purchase
          const meetsMinimum = !voucher.min_purchase_amount || price >= voucher.min_purchase_amount;

          if (withinUsageLimit && withinPerUserLimit && courseApplicable && meetsMinimum) {
            // Calculate discount
            if (voucher.discount_type === 'percentage') {
              discountAmount = (price * voucher.discount_value) / 100;
              if (voucher.max_discount_amount) {
                discountAmount = Math.min(discountAmount, voucher.max_discount_amount);
              }
            } else {
              discountAmount = Math.min(voucher.discount_value, price);
            }

            finalPrice = Math.max(0, price - discountAmount);
            voucherData = {
              id: voucher.id,
              code: voucher.code,
              name: voucher.name,
              discountAmount,
              originalPrice: price,
              finalPrice
            };

            console.log('Voucher applied:', voucherData);
          }
        }
      }
    }

    console.log('Creating Stripe checkout session with:', {
      finalPrice,
      discountAmount,
      voucherApplied: !!voucherData,
      userEmail
    });

    // Create payment intent in database first
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.81.1');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: paymentIntent, error: intentError } = await supabase
      .from('payment_intents')
      .insert({
        customer_email: userEmail || '',
        course_slug: courseSlug,
        course_title: courseTitle,
        original_price: price,
        final_price: finalPrice,
        voucher_code: voucherData?.code || null,
        payment_method: 'stripe',
        payment_status: 'pending',
        metadata: voucherData ? {
          voucherId: voucherData.id,
          voucherCode: voucherData.code,
          discountAmount: discountAmount
        } : {}
      })
      .select()
      .single();

    if (intentError) {
      console.error('Error creating payment intent:', intentError);
      throw new Error('Failed to create payment intent');
    }

    console.log('Payment intent created:', paymentIntent.id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: courseTitle,
              description: voucherData
                ? `Enroll in ${courseTitle} course (Discount: £${discountAmount.toFixed(2)})`
                : `Enroll in ${courseTitle} course`,
            },
            unit_amount: Math.round(finalPrice * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/thank-you`,
      cancel_url: `${req.headers.get('origin')}/courses`,
      metadata: {
        courseSlug,
        courseTitle,
        paymentIntentId: paymentIntent.id,
        ...(voucherData && {
          voucherId: voucherData.id,
          voucherCode: voucherData.code,
          originalPrice: price.toString(),
          discountAmount: discountAmount.toFixed(2),
          userEmail: userEmail || ''
        })
      },
    });

    // Update payment intent with Stripe session ID
    await supabase
      .from('payment_intents')
      .update({ provider_session_id: session.id })
      .eq('id', paymentIntent.id);

    console.log('Checkout session created successfully:', {
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: session.amount_total,
      currency: session.currency
    });

    if (!session.url) {
      console.error('ERROR: Stripe did not return a checkout URL!', session);
      throw new Error('Stripe checkout session created but no URL returned');
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
