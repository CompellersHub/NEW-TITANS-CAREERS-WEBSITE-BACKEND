import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  submission_id: string;
  form_type: string;
  status: string;
  form_data: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { submission_id, form_type, status, form_data }: NotificationRequest = await req.json();
    
    console.log("Processing notification for submission:", submission_id);

    // Get all admin notification preferences
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from("admin_notification_preferences")
      .select("*")
      .eq("instant_alerts", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      throw prefsError;
    }

    if (!preferences || preferences.length === 0) {
      console.log("No admins with instant alerts enabled");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Filter admins based on their preferences
    const adminsToNotify = preferences.filter(pref => {
      // Check form type preference
      const formTypeMatch = 
        (form_type === "contact" && pref.notify_contact_form) ||
        (form_type === "quick-contact" && pref.notify_quick_contact) ||
        (form_type === "feedback" && pref.notify_feedback);
      
      if (!formTypeMatch) return false;

      // Check status preference
      const statusMatch =
        (status === "new" && pref.notify_new_status) ||
        (status === "in_progress" && pref.notify_in_progress_status) ||
        (status === "resolved" && pref.notify_resolved_status) ||
        (status === "archived" && pref.notify_archived_status);

      return statusMatch;
    });

    if (adminsToNotify.length === 0) {
      console.log("No admins match the notification criteria");
      return new Response(
        JSON.stringify({ message: "No admins match criteria" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Sending notifications to ${adminsToNotify.length} admins`);

    // Send emails via Brevo
    const emailPromises = adminsToNotify.map(async (admin) => {
      const formTypeName = form_type.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                New ${formTypeName} Submission
              </h2>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
                ${form_data.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${form_data.email}</p>` : ''}
                ${form_data.name ? `<p style="margin: 5px 0;"><strong>Name:</strong> ${form_data.name}</p>` : ''}
              </div>

              ${form_data.message || form_data.comment ? `
                <div style="background-color: #fff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Message:</strong></p>
                  <p style="margin: 10px 0 0 0;">${form_data.message || form_data.comment}</p>
                </div>
              ` : ''}

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://').split('.supabase.co')[0]}.lovableproject.com/admin/form-submissions" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  View in Dashboard
                </a>
              </div>

              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                You're receiving this because you have instant alerts enabled for ${formTypeName} submissions with ${status.replace('_', ' ')} status.
              </p>
            </div>
          </body>
        </html>
      `;

      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Form Notifications", email: "noreply@yourdomain.com" },
          to: [{ email: admin.email }],
          subject: `New ${formTypeName} Submission`,
          htmlContent: emailHtml,
        }),
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error(`Failed to send email to ${admin.email}:`, errorText);
        throw new Error(`Brevo API error: ${errorText}`);
      }

      console.log(`Email sent successfully to ${admin.email}`);
      return brevoResponse.json();
    });

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: "Notifications sent successfully",
        count: adminsToNotify.length 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
