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

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

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
        ...(voucherData && {
          voucherId: voucherData.id,
          voucherCode: voucherData.code,
          originalPrice: price.toString(),
          discountAmount: discountAmount.toFixed(2),
          userEmail: userEmail || ''
        })
      },
    });

    console.log('Checkout session created:', session.id);

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
