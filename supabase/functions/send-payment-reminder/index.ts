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

    // Check for payments expiring in 2 days
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    console.log('Checking for payments expiring between:', twoDaysFromNow.toISOString(), 'and', threeDaysFromNow.toISOString());

    // Check payment_intents
    const { data: expiringIntents, error: intentsError } = await supabase
      .from('payment_intents')
      .select('*')
      .in('payment_status', ['pending', 'awaiting_payment'])
      .gte('expires_at', twoDaysFromNow.toISOString())
      .lte('expires_at', threeDaysFromNow.toISOString());

    if (intentsError) {
      console.error('Error fetching expiring intents:', intentsError);
      throw intentsError;
    }

    console.log(`Found ${expiringIntents?.length || 0} expiring payment intents`);

    // Send reminder emails
    if (expiringIntents && expiringIntents.length > 0) {
      for (const intent of expiringIntents) {
        const expiryDate = new Date(intent.expires_at || '');
        const hoursRemaining = Math.floor((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60));

        try {
          await resend.emails.send({
            from: "Titans Training <onboarding@resend.dev>",
            to: [intent.customer_email],
            subject: `⏰ Payment Reminder - ${intent.course_title}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                    .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
                    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .payment-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>⏰ Payment Expiring Soon</h1>
                    </div>
                    <div class="content">
                      <p>Dear ${intent.customer_name || 'Student'},</p>
                      
                      <div class="warning-box">
                        <strong>⚠️ Your payment is expiring in approximately ${hoursRemaining} hours!</strong>
                      </div>

                      <p>This is a friendly reminder that your enrollment for <strong>${intent.course_title}</strong> will expire soon.</p>

                      <div class="payment-details">
                        <p><strong>Course:</strong> ${intent.course_title}</p>
                        <p><strong>Amount:</strong> £${intent.final_price.toFixed(2)}</p>
                        <p><strong>Payment Method:</strong> ${intent.payment_method}</p>
                        <p><strong>Payment Reference:</strong> ${intent.payment_reference || 'N/A'}</p>
                        <p><strong>Expires:</strong> ${expiryDate.toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</p>
                      </div>

                      <p><strong>What you need to do:</strong></p>
                      ${intent.payment_method === 'bank_transfer' ? `
                        <ol>
                          <li>Complete your bank transfer using the reference: <strong>${intent.payment_reference}</strong></li>
                          <li>Upload proof of payment</li>
                        </ol>
                      ` : `
                        <ol>
                          <li>Complete your payment as soon as possible</li>
                          <li>Check your payment status page for updates</li>
                        </ol>
                      `}

                      <a href="${Deno.env.get('VITE_SUPABASE_URL')?.replace('.supabase.co', '.app')}/payment-status?reference=${intent.payment_reference}" class="cta-button">View Payment Status</a>

                      <p>If you've already completed your payment, please disregard this reminder.</p>
                      <p>If you need assistance, please contact us immediately.</p>

                      <p>Best regards,<br/>The Titans Training Team</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          });
          console.log(`Sent reminder email to ${intent.customer_email}`);
        } catch (emailError) {
          console.error(`Failed to send reminder email to ${intent.customer_email}:`, emailError);
        }
      }
    }

    // Check bank_transfer_orders
    const { data: expiringOrders, error: ordersError } = await supabase
      .from('bank_transfer_orders')
      .select('*')
      .in('status', ['pending', 'awaiting_payment'])
      .gte('expires_at', twoDaysFromNow.toISOString())
      .lte('expires_at', threeDaysFromNow.toISOString());

    if (ordersError) {
      console.error('Error fetching expiring orders:', ordersError);
      throw ordersError;
    }

    console.log(`Found ${expiringOrders?.length || 0} expiring bank transfer orders`);

    const totalReminders = (expiringIntents?.length || 0) + (expiringOrders?.length || 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        remindersSent: totalReminders,
        expiringIntents: expiringIntents?.length || 0,
        expiringOrders: expiringOrders?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Error sending payment reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
