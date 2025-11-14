import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date().toISOString();
    console.log('Checking for expired payments at:', now);

    // Check expired payment_intents
    const { data: expiredIntents, error: intentsError } = await supabase
      .from('payment_intents')
      .select('*')
      .in('payment_status', ['pending', 'awaiting_payment'])
      .lt('expires_at', now)
      .neq('payment_status', 'expired');

    if (intentsError) {
      console.error('Error fetching expired intents:', intentsError);
      throw intentsError;
    }

    console.log(`Found ${expiredIntents?.length || 0} expired payment intents`);

    // Update expired intents
    if (expiredIntents && expiredIntents.length > 0) {
      const intentIds = expiredIntents.map(intent => intent.id);
      
      const { error: updateError } = await supabase
        .from('payment_intents')
        .update({ payment_status: 'expired', updated_at: now })
        .in('id', intentIds);

      if (updateError) {
        console.error('Error updating expired intents:', updateError);
        throw updateError;
      }

      // Send expiry emails
      for (const intent of expiredIntents) {
        try {
          await resend.emails.send({
            from: "Titans Training <onboarding@resend.dev>",
            to: [intent.customer_email],
            subject: `Payment Expired - ${intent.course_title}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>⏰ Payment Expired</h1>
                    </div>
                    <div class="content">
                      <p>Dear ${intent.customer_name || 'Student'},</p>
                      <p>Your payment for <strong>${intent.course_title}</strong> has expired.</p>
                      <p><strong>Payment Reference:</strong> ${intent.payment_reference || 'N/A'}</p>
                      <p>If you still wish to enroll in this course, please register again on our website.</p>
                      <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('.supabase.co', '.app')}/courses" class="cta-button">Browse Courses</a>
                      <p>If you believe this is an error or have already made the payment, please contact us immediately.</p>
                      <p>Best regards,<br/>The Titans Training Team</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          console.log(`Sent expiry email to ${intent.customer_email}`);
        } catch (emailError) {
          console.error(`Failed to send expiry email to ${intent.customer_email}:`, emailError);
        }
      }
    }

    // Check expired bank_transfer_orders
    const { data: expiredOrders, error: ordersError } = await supabase
      .from('bank_transfer_orders')
      .select('*')
      .in('status', ['pending', 'awaiting_payment'])
      .lt('expires_at', now)
      .neq('status', 'expired');

    if (ordersError) {
      console.error('Error fetching expired orders:', ordersError);
      throw ordersError;
    }

    console.log(`Found ${expiredOrders?.length || 0} expired bank transfer orders`);

    // Update expired orders
    if (expiredOrders && expiredOrders.length > 0) {
      const orderIds = expiredOrders.map(order => order.id);
      
      const { error: updateOrderError } = await supabase
        .from('bank_transfer_orders')
        .update({ status: 'expired', updated_at: now })
        .in('id', orderIds);

      if (updateOrderError) {
        console.error('Error updating expired orders:', updateOrderError);
        throw updateOrderError;
      }
    }

    const totalExpired = (expiredIntents?.length || 0) + (expiredOrders?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        expiredPayments: totalExpired,
        expiredIntents: expiredIntents?.length || 0,
        expiredOrders: expiredOrders?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error checking expired payments:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
