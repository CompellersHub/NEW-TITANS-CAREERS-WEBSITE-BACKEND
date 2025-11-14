import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  metadata: {
    thread_id: string;
    reply_id?: string;
    author_name: string;
    thread_title: string;
    course_slug: string;
    preview: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, content, metadata }: EmailRequest = await req.json();

    console.log("Sending discussion email to:", to);

    const appUrl = Deno.env.get("APP_URL") || "https://your-domain.com";
    const threadUrl = `${appUrl}/courses/${metadata.course_slug}?tab=discussions&thread=${metadata.thread_id}`;

    // Generate tracking URL for preferences link
    const trackingBaseUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-email-link`;
    const preferencesUrl = `${trackingBaseUrl}?email=${encodeURIComponent(to)}&link_type=preferences&email_type=instant_notification&redirect_to=${encodeURIComponent("/profile?tab=notifications")}`;

    const emailResponse = await resend.emails.send({
      from: "Titans Careers <notifications@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Titans Careers</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Course Discussion</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">${subject}</h2>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>${metadata.author_name}</strong> wrote:</p>
                <p style="margin: 0; color: #4b5563; font-style: italic;">"${metadata.preview}${metadata.preview.length >= 100 ? "..." : ""}"</p>
              </div>
              
              <p style="color: #4b5563; margin: 20px 0;">Discussion: <strong>${metadata.thread_title}</strong></p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${threadUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View Discussion
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 15px 0;">
                <a href="${preferencesUrl}" style="color: #667eea; text-decoration: none;">
                  📧 Manage Email Preferences
                </a>
              </p>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 10px 0;">
                You're receiving this email because you're enrolled in this course and have notifications enabled.
              </p>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 5px 0;">
                Change how often you receive notifications or turn them off entirely
              </p>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 5px 0;">
                ${to}
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending discussion email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
