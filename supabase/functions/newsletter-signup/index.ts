import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSignupRequest {
  email: string;
  name?: string;
  whatsapp?: string;
  source?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, whatsapp, source }: NewsletterSignupRequest = await req.json();

    console.log("Newsletter signup request:", { email, name, whatsapp, source });

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate inputs
    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email must be less than 255 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (name && name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be less than 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (whatsapp && whatsapp.length > 50) {
      return new Response(
        JSON.stringify({ error: "WhatsApp number must be less than 50 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, active")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.active) {
        return new Response(
          JSON.stringify({ message: "You're already subscribed to our newsletter!" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ active: true, subscribed_at: new Date().toISOString() })
          .eq("email", email);

        if (updateError) {
          console.error("Error reactivating subscription:", updateError);
          throw updateError;
        }
      }
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email,
          name: name || null,
          whatsapp: whatsapp || null,
          source: source || "unknown",
          active: true,
        });

      if (insertError) {
        console.error("Error inserting subscriber:", insertError);
        throw insertError;
      }
    }

    // Send welcome email via Brevo
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    if (brevoApiKey) {
      console.log("Sending welcome email via Brevo...");
      
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: "Titans Careers",
            email: "noreply@titanscareer.com", // Replace with your verified sender email
          },
          to: [
            {
              email: email,
              name: name || email,
            },
          ],
          subject: "Welcome to Titans Careers! 🚀",
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Welcome to Titans Careers!</h1>
              </div>
              
              <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; color: #1e3a5f; margin-bottom: 20px;">
                  Hi ${name || "there"}! 👋
                </p>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Thank you for joining the Titans Careers community! You've just taken the first step towards transforming your career.
                </p>
                
                <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 20px; margin: 30px 0; border-radius: 5px;">
                  <h2 style="color: #1e3a5f; margin-top: 0; font-size: 20px;">What's Next?</h2>
                  <ul style="margin: 15px 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">📚 Get access to our <strong>free career resources</strong></li>
                    <li style="margin-bottom: 10px;">💡 Receive weekly <strong>career tips and insights</strong></li>
                    <li style="margin-bottom: 10px;">🎯 Learn about <strong>high-demand roles</strong> in AML, Data Analysis & more</li>
                    <li style="margin-bottom: 10px;">🚀 Hear about our <strong>upcoming courses and events</strong></li>
                  </ul>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                  We're here to help you break into high-paying professional careers. No degree required. No coding required. Just practical skills that employers actually want.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                  <a href="https://titanscareer.com/resources" style="display: inline-block; background: #fbbf24; color: #1e3a5f; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Download Free Resources
                  </a>
                </div>
                
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Have questions? Just reply to this email - we'd love to hear from you!
                </p>
                
                <p style="font-size: 16px; margin-bottom: 5px;">
                  To your success,
                </p>
                <p style="font-size: 16px; font-weight: bold; color: #1e3a5f; margin-top: 5px;">
                  The Titans Careers Team
                </p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
                <p style="margin: 5px 0;">Titans Careers - Building Real Careers, Not Just Courses</p>
                <p style="margin: 5px 0;">
                  <a href="https://titanscareer.com" style="color: #2563eb; text-decoration: none;">Visit our website</a>
                </p>
                <p style="margin: 15px 0 5px 0; font-size: 12px;">
                  You're receiving this because you signed up for career insights from Titans Careers.
                </p>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error("Brevo API error:", errorText);
        // Don't fail the signup if email fails - log and continue
      } else {
        console.log("Welcome email sent successfully via Brevo");
        
        // Mark welcome email as sent
        await supabase
          .from("newsletter_subscribers")
          .update({ welcome_email_sent: true })
          .eq("email", email);
      }
    } else {
      console.warn("BREVO_API_KEY not configured - skipping welcome email");
    }

    return new Response(
      JSON.stringify({
        message: "Successfully subscribed! Check your email for a welcome message.",
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in newsletter-signup function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
