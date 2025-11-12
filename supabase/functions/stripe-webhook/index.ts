import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const resendKey = Deno.env.get('RESEND_API_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !resendKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    // Verify webhook signature if secret is configured
    let event: Stripe.Event;
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Processing webhook event:', event.type);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Checkout session completed:', {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        courseSlug: session.metadata?.courseSlug,
      });

      const customerEmail = session.customer_details?.email;
      const courseTitle = session.metadata?.courseTitle || 'Your Course';
      const courseSlug = session.metadata?.courseSlug || '';
      const price = session.amount_total ? session.amount_total / 100 : 0;

      if (customerEmail) {
        // Save enrollment to database
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            customer_email: customerEmail,
            course_slug: courseSlug,
            course_title: courseTitle,
            price: price,
            stripe_session_id: session.id,
          });

        if (enrollmentError) {
          console.error('Failed to save enrollment:', enrollmentError);
        } else {
          console.log('Enrollment saved successfully');
        }
        // Send confirmation email using Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Titans Careers <onboarding@resend.dev>',
            to: [customerEmail],
            subject: `Welcome to ${courseTitle}!`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1 style="margin: 0;">🎉 Welcome to Titans Careers!</h1>
                    </div>
                    <div class="content">
                      <h2>Thank you for enrolling in ${courseTitle}</h2>
                      <p>We're excited to have you on board! Your payment has been successfully processed.</p>
                      
                      <h3>What's Next?</h3>
                      <ul>
                        <li>You'll receive login credentials for the learning platform within the next few minutes</li>
                        <li>Access your course at <strong>learn.titanscareers.com</strong></li>
                        <li>Start learning at your own pace with lifetime access</li>
                      </ul>

                      <div style="text-align: center;">
                        <a href="https://learn.titanscareers.com" class="button">Access Your Course</a>
                      </div>

                      <h3>Need Help?</h3>
                      <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>

                      <p>Happy learning!</p>
                      <p><strong>The Titans Careers Team</strong></p>
                    </div>
                    <div class="footer">
                      <p>This email was sent because you enrolled in a course at Titans Careers.</p>
                    </div>
                  </div>
                </body>
              </html>
            `,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log('Confirmation email sent:', emailResult);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
