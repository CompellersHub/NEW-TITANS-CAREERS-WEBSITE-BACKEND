import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate unique payment reference
function generateReference(courseSlug: string): string {
  const courseCode = courseSlug.split('-')[0].toUpperCase().substring(0, 4);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TITANS-${courseCode}-${random}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseSlug, courseTitle, price, voucherCode, email, name } = await req.json();

    console.log('Creating bank transfer order:', { courseSlug, courseTitle, price, email });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique reference
    const reference = generateReference(courseSlug);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to complete payment

    // Create payment intent
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
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        payment_reference: reference,
        expires_at: expiresAt.toISOString(),
        metadata: { voucherCode }
      })
      .select()
      .single();

    if (intentError) {
      console.error('Error creating payment intent:', intentError);
      throw intentError;
    }

    // Create bank transfer order
    const { error: orderError } = await supabaseClient
      .from('bank_transfer_orders')
      .insert({
        payment_intent_id: paymentIntent.id,
        payment_reference: reference,
        customer_email: email,
        customer_name: name,
        course_title: courseTitle,
        course_slug: courseSlug,
        amount: price,
        status: 'awaiting_payment',
        expires_at: expiresAt.toISOString()
      });

    if (orderError) {
      console.error('Error creating bank order:', orderError);
      throw orderError;
    }

    // Send instructions email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const BANK_ACCOUNT_NAME = Deno.env.get('BANK_TRANSFER_ACCOUNT_NAME') || 'Titans Careers Ltd';
    const BANK_SORT_CODE = Deno.env.get('BANK_TRANSFER_SORT_CODE') || '12-34-56';
    const BANK_ACCOUNT_NUMBER = Deno.env.get('BANK_TRANSFER_ACCOUNT_NUMBER') || '12345678';

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Titans Careers <payments@titanscareers.com>',
          to: [email],
          subject: `Bank Transfer Details - ${courseTitle}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1a1a1a;">Bank Transfer Payment Instructions</h1>
              <p>Hi ${name || 'there'},</p>
              <p>Thank you for enrolling in <strong>${courseTitle}</strong>! Please complete your payment using the bank details below.</p>
              
              <div style="background: #f5f5f5; padding: 24px; border-radius: 8px; margin: 24px 0; border: 2px solid #2563eb;">
                <h2 style="margin-top: 0; color: #2563eb;">Payment Details</h2>
                <table style="width: 100%; font-size: 16px;">
                  <tr>
                    <td style="padding: 8px 0;"><strong>Account Name:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">${BANK_ACCOUNT_NAME}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Sort Code:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 18px;">${BANK_SORT_CODE}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Account Number:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 18px;">${BANK_ACCOUNT_NUMBER}</td>
                  </tr>
                  <tr style="border-top: 2px solid #ddd;">
                    <td style="padding: 12px 0 8px;"><strong>Reference:</strong></td>
                    <td style="padding: 12px 0 8px; text-align: right; font-family: monospace; font-size: 18px; color: #dc2626; font-weight: bold;">${reference}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Amount:</strong></td>
                    <td style="padding: 8px 0; text-align: right; font-size: 24px; font-weight: bold; color: #2563eb;">£${price.toFixed(2)}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>⚠️ Important:</strong> You must include the reference <strong>${reference}</strong> when making your payment. This ensures we can match your payment to your enrollment.</p>
              </div>

              <div style="background: #dbeafe; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Payment Deadline</h3>
                <p style="margin: 0;">Please complete your payment by <strong>${expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #666;">After this date, you'll need to re-enroll.</p>
              </div>

              <h3>How to Pay</h3>
              <div style="margin: 16px 0;">
                <p><strong>Mobile Banking:</strong></p>
                <ol style="margin: 8px 0; padding-left: 20px;">
                  <li>Open your banking app</li>
                  <li>Select "Pay" or "Make a payment"</li>
                  <li>Enter the account details above</li>
                  <li>Enter the reference: <strong>${reference}</strong></li>
                  <li>Enter amount: £${price.toFixed(2)}</li>
                  <li>Confirm payment</li>
                </ol>
              </div>

              <div style="margin: 16px 0;">
                <p><strong>Online Banking:</strong></p>
                <ol style="margin: 8px 0; padding-left: 20px;">
                  <li>Log into your online banking</li>
                  <li>Go to payments or transfers</li>
                  <li>Add new payee with details above</li>
                  <li>Make payment with reference <strong>${reference}</strong></li>
                </ol>
              </div>

              <h3>After Payment</h3>
              <p>We'll verify your payment within 1-2 business days and send you course access details.</p>
              
              <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('/supabase', '')}/payment-status?ref=${reference}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Check Payment Status
              </a>

              <p style="color: #666; font-size: 14px; margin-top: 40px;">
                Questions? Contact us at info@titanscareers.com or WhatsApp +44 7539 434403
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                <p style="font-size: 12px; color: #999;">Flexible payment options available at www.payl8r.com</p>
              </div>
            </div>
          `
        })
      });
    }

    console.log('Bank transfer order created:', reference);

    return new Response(
      JSON.stringify({ 
        success: true,
        reference,
        expiresAt: expiresAt.toISOString(),
        paymentIntentId: paymentIntent.id,
        bankDetails: {
          accountName: BANK_ACCOUNT_NAME,
          sortCode: BANK_SORT_CODE,
          accountNumber: BANK_ACCOUNT_NUMBER,
          amount: price
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-bank-transfer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});