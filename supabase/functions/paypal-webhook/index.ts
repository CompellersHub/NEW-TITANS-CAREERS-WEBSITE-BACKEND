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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event = await req.json();
    console.log('PayPal webhook received:', event.event_type);

    // Handle different PayPal events
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource.id;
      
      // Find payment intent
      const { data: paymentIntent, error: intentError } = await supabaseClient
        .from('payment_intents')
        .select('*')
        .eq('provider_session_id', orderId)
        .single();

      if (intentError || !paymentIntent) {
        console.error('Payment intent not found for order:', orderId);
        throw new Error('Payment intent not found');
      }

      // Update payment intent as completed
      await supabaseClient
        .from('payment_intents')
        .update({
          payment_status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: { ...paymentIntent.metadata, paypal_event: event }
        })
        .eq('id', paymentIntent.id);

      // Create enrollment
      const { error: enrollmentError } = await supabaseClient
        .from('enrollments')
        .insert({
          course_slug: paymentIntent.course_slug,
          course_title: paymentIntent.course_title,
          customer_email: paymentIntent.customer_email,
          price: paymentIntent.final_price,
          payment_method: 'paypal',
          payment_status: 'completed',
          payment_provider_reference: orderId,
          payment_metadata: { voucher_code: paymentIntent.voucher_code }
        });

      if (enrollmentError) {
        console.error('Error creating enrollment:', enrollmentError);
        throw enrollmentError;
      }

      // Send confirmation email via Resend
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Titans Careers <noreply@titanscareers.com>',
            to: [paymentIntent.customer_email],
            subject: `Payment Confirmed - Welcome to ${paymentIntent.course_title}!`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Payment Confirmed via PayPal ✅</h1>
                <p>Thank you for your payment! Your enrollment in <strong>${paymentIntent.course_title}</strong> is now active.</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Course:</strong> ${paymentIntent.course_title}</p>
                  <p><strong>Amount Paid:</strong> £${paymentIntent.final_price.toFixed(2)}</p>
                  <p><strong>Payment Method:</strong> PayPal</p>
                  <p><strong>Transaction ID:</strong> ${orderId}</p>
                </div>
                <p>You can now access your course materials and start learning!</p>
                <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('/supabase', '')}/course/${paymentIntent.course_slug}" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  Access Your Course
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 40px;">
                  Questions? Contact us at info@titanscareers.com
                </p>
              </div>
            `
          })
        });
      }

      console.log('PayPal payment processed successfully for:', paymentIntent.customer_email);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in paypal-webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});