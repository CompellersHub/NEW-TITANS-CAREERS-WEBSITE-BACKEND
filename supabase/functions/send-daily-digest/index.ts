import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const currentHour = now.getUTCHours();
    
    console.log(`Running daily digest for hour: ${currentHour} UTC`);

    // Get all admins with daily digest enabled for this hour
    const { data: adminPrefs, error: prefsError } = await supabaseAdmin
      .from("admin_notification_preferences")
      .select("*")
      .eq("daily_digest", true)
      .eq("digest_time", currentHour);

    if (prefsError) {
      console.error("Error fetching admin preferences:", prefsError);
      throw prefsError;
    }

    if (!adminPrefs || adminPrefs.length === 0) {
      console.log(`No admins scheduled for digest at hour ${currentHour}`);
      return new Response(
        JSON.stringify({ message: "No admins to notify at this hour" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    console.log(`Processing digest for ${adminPrefs.length} admins`);

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Get submissions from the last 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const { data: submissions, error: submissionsError } = await supabaseAdmin
      .from("form_submissions")
      .select("*")
      .gte("submitted_at", twentyFourHoursAgo.toISOString())
      .order("submitted_at", { ascending: false });

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      throw submissionsError;
    }

    if (!submissions || submissions.length === 0) {
      console.log("No submissions in the last 24 hours");
      // Still send email to admins saying no new submissions
    }

    // Send digest email to each admin
    const emailPromises = adminPrefs.map(async (admin) => {
      // Filter submissions based on admin preferences
      const filteredSubmissions = (submissions || []).filter(sub => {
        // Check form type preference
        const formTypeMatch = 
          (sub.form_type === "contact" && admin.notify_contact_form) ||
          (sub.form_type === "quick-contact" && admin.notify_quick_contact) ||
          (sub.form_type === "feedback" && admin.notify_feedback);
        
        if (!formTypeMatch) return false;

        // Check status preference
        const statusMatch =
          (sub.status === "new" && admin.notify_new_status) ||
          (sub.status === "in_progress" && admin.notify_in_progress_status) ||
          (sub.status === "resolved" && admin.notify_resolved_status) ||
          (sub.status === "archived" && admin.notify_archived_status);

        return statusMatch;
      });

      // Group submissions by form type
      const byFormType = filteredSubmissions.reduce((acc, sub) => {
        if (!acc[sub.form_type]) acc[sub.form_type] = [];
        acc[sub.form_type].push(sub);
        return acc;
      }, {} as Record<string, any[]>);

      // Group submissions by status
      const byStatus = filteredSubmissions.reduce((acc, sub) => {
        if (!acc[sub.status]) acc[sub.status] = [];
        acc[sub.status].push(sub);
        return acc;
      }, {} as Record<string, any[]>);

      // Generate email HTML
      const formTypeName = (type: string) => 
        type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const statusName = (status: string) =>
        status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const submissionsHtml = filteredSubmissions.length > 0 ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Summary by Status</h3>
          ${Object.entries(byStatus).map(([status, subs]) => `
            <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
              <strong>${statusName(status)}:</strong> ${subs.length} submission${subs.length !== 1 ? 's' : ''}
            </div>
          `).join('')}
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Summary by Form Type</h3>
          ${Object.entries(byFormType).map(([type, subs]) => `
            <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
              <strong>${formTypeName(type)}:</strong> ${subs.length} submission${subs.length !== 1 ? 's' : ''}
            </div>
          `).join('')}
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #2563eb; margin-bottom: 15px;">Recent Submissions</h3>
          ${filteredSubmissions.slice(0, 10).map(sub => {
            const data = sub.form_data;
            return `
              <div style="border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 15px; background-color: #f9fafb;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <strong style="color: #1f2937;">${formTypeName(sub.form_type)}</strong>
                  <span style="color: #6b7280; font-size: 12px;">${new Date(sub.submitted_at).toLocaleString()}</span>
                </div>
                ${data.email ? `<p style="margin: 5px 0; font-size: 14px;"><strong>From:</strong> ${data.name || 'Anonymous'} (${data.email})</p>` : ''}
                ${data.message || data.comment ? `
                  <p style="margin: 10px 0 0 0; font-size: 14px; color: #4b5563;">
                    ${(data.message || data.comment).substring(0, 150)}${(data.message || data.comment).length > 150 ? '...' : ''}
                  </p>
                ` : ''}
              </div>
            `;
          }).join('')}
          ${filteredSubmissions.length > 10 ? `
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              ... and ${filteredSubmissions.length - 10} more submission${filteredSubmissions.length - 10 !== 1 ? 's' : ''}
            </p>
          ` : ''}
        </div>
      ` : `
        <div style="text-align: center; padding: 40px; background-color: #f9fafb; border-radius: 5px;">
          <p style="color: #6b7280; font-size: 16px; margin: 0;">
            No new submissions matching your preferences in the last 24 hours.
          </p>
        </div>
      `;

      const emailHtml = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px;">
                Daily Submissions Digest
              </h1>
              
              <p style="color: #4b5563; font-size: 14px; margin: 20px 0;">
                Here's your summary of form submissions from the last 24 hours.
              </p>

              <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h2 style="margin: 0; color: #1e40af; font-size: 24px;">
                  ${filteredSubmissions.length}
                </h2>
                <p style="margin: 5px 0 0 0; color: #1e40af; font-weight: 500;">
                  Total Submission${filteredSubmissions.length !== 1 ? 's' : ''} Matching Your Preferences
                </p>
              </div>

              ${submissionsHtml}

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://').split('.supabase.co')[0]}.lovableproject.com/admin/form-submissions" 
                   style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 500;">
                  View All Submissions
                </a>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  You're receiving this digest because you have daily digest enabled at ${currentHour}:00 UTC.
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://', 'https://').split('.supabase.co')[0]}.lovableproject.com/admin/notification-settings" 
                     style="color: #2563eb; text-decoration: none;">
                    Update notification preferences
                  </a>
                </p>
              </div>
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
          sender: { name: "Form Submissions Digest", email: "noreply@yourdomain.com" },
          to: [{ email: admin.email }],
          subject: `Daily Digest: ${filteredSubmissions.length} Form Submission${filteredSubmissions.length !== 1 ? 's' : ''}`,
          htmlContent: emailHtml,
        }),
      });

      if (!brevoResponse.ok) {
        const errorText = await brevoResponse.text();
        console.error(`Failed to send digest to ${admin.email}:`, errorText);
        throw new Error(`Brevo API error: ${errorText}`);
      }

      console.log(`Digest email sent successfully to ${admin.email}`);
      return brevoResponse.json();
    });

    await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({ 
        message: "Daily digests sent successfully",
        count: adminPrefs.length,
        hour: currentHour,
        submissions_count: submissions?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in send-daily-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
