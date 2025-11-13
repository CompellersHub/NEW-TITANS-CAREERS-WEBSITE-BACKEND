import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { voucherCode, courseSlug, price, userEmail } = await req.json();

    if (!voucherCode || !courseSlug || !price) {
      throw new Error('Missing required fields: voucherCode, courseSlug, or price');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Validating voucher:', voucherCode, 'for course:', courseSlug);

    // Fetch voucher
    const { data: voucher, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucherCode.toUpperCase())
      .single();

    if (fetchError || !voucher) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Invalid voucher code' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Validation checks
    const now = new Date();
    const validFrom = new Date(voucher.valid_from);
    const validUntil = new Date(voucher.valid_until);

    if (!voucher.is_active) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This voucher is no longer active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (now < validFrom) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This voucher is not yet valid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    if (now > validUntil) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This voucher has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check usage limit
    if (voucher.usage_limit && voucher.usage_count >= voucher.usage_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This voucher has reached its usage limit' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check per-user limit
    if (voucher.per_user_limit && userEmail) {
      const { count } = await supabase
        .from('voucher_usage')
        .select('*', { count: 'exact', head: true })
        .eq('voucher_id', voucher.id)
        .eq('user_email', userEmail);

      if (count && count >= voucher.per_user_limit) {
        return new Response(
          JSON.stringify({ valid: false, error: 'You have already used this voucher the maximum number of times' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Check applicable courses
    if (voucher.applicable_courses && voucher.applicable_courses.length > 0) {
      if (!voucher.applicable_courses.includes(courseSlug)) {
        return new Response(
          JSON.stringify({ valid: false, error: 'This voucher is not applicable to this course' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Check minimum purchase amount
    if (voucher.min_purchase_amount && price < voucher.min_purchase_amount) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Minimum purchase amount of £${voucher.min_purchase_amount} required` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.discount_type === 'percentage') {
      discountAmount = (price * voucher.discount_value) / 100;
      if (voucher.max_discount_amount) {
        discountAmount = Math.min(discountAmount, voucher.max_discount_amount);
      }
    } else {
      discountAmount = Math.min(voucher.discount_value, price);
    }

    const finalPrice = Math.max(0, price - discountAmount);

    console.log('Voucher valid:', {
      discountAmount,
      finalPrice,
      discountType: voucher.discount_type,
      discountValue: voucher.discount_value
    });

    return new Response(
      JSON.stringify({
        valid: true,
        voucher: {
          code: voucher.code,
          name: voucher.name,
          discountType: voucher.discount_type,
          discountValue: voucher.discount_value
        },
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        originalPrice: price
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error validating voucher:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ valid: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
