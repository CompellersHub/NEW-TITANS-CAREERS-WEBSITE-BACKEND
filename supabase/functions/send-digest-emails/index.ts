import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting digest email process...");

    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Get users who should receive digests now
    const { data: preferences, error: prefsError } = await supabase
      .from("email_notification_preferences")
      .select("user_id, frequency, digest_time, last_digest_sent_at")
      .in("frequency", ["daily", "weekly"])
      .eq("digest_time", currentHour);

    if (prefsError) throw prefsError;

    console.log(`Found ${preferences?.length || 0} users to process`);

    let sentCount = 0;

    for (const pref of preferences || []) {
      const now = new Date();
      const lastSent = pref.last_digest_sent_at ? new Date(pref.last_digest_sent_at) : null;

      // Check if it's time to send based on frequency
      let shouldSend = false;

      if (pref.frequency === "daily") {
        // Send if never sent or last sent more than 23 hours ago
        shouldSend = !lastSent || (now.getTime() - lastSent.getTime()) > 23 * 60 * 60 * 1000;
      } else if (pref.frequency === "weekly") {
        // Send on Monday (day 1)
        if (currentDay === 1) {
          shouldSend = !lastSent || (now.getTime() - lastSent.getTime()) > 6 * 24 * 60 * 60 * 1000;
        }
      }

      if (!shouldSend) {
        console.log(`Skipping user ${pref.user_id} - not time yet`);
        continue;
      }

      // Get queued notifications for this user
      const { data: notifications, error: notifError } = await supabase
        .from("queued_email_notifications")
        .select("*")
        .eq("user_id", pref.user_id)
        .eq("sent", false)
        .order("created_at", { ascending: false });

      if (notifError) throw notifError;

      if (!notifications || notifications.length === 0) {
        console.log(`No notifications for user ${pref.user_id}`);
        continue;
      }

      // Get user email
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        pref.user_id
      );

      if (userError || !userData?.user?.email) {
        console.error(`Error getting user ${pref.user_id}:`, userError);
        continue;
      }

      const userEmail = userData.user.email;

      // Group notifications by type
      const replyCount = notifications.filter((n) => n.notification_type === "reply").length;
      const mentionCount = notifications.filter((n) => n.notification_type === "mention").length;

      // Generate tracking URLs
      const appUrl = Deno.env.get("APP_URL") || "https://your-domain.com";
      const trackingBaseUrl = `${supabaseUrl}/functions/v1/track-email-link`;
      
      const preferencesUrl = `${trackingBaseUrl}?email=${encodeURIComponent(userEmail)}&link_type=preferences&email_type=digest&user_id=${pref.user_id}&redirect_to=${encodeURIComponent("/profile?tab=notifications")}`;
      const unsubscribeUrl = `${trackingBaseUrl}?email=${encodeURIComponent(userEmail)}&link_type=unsubscribe_digest&email_type=digest&user_id=${pref.user_id}&redirect_to=${encodeURIComponent("/profile?tab=notifications")}`;

      // Create tracking record for email opens
      const trackingId = crypto.randomUUID();
      const { error: trackingError } = await supabase
        .from("email_sends")
        .insert({
          email: userEmail,
          template_id: null,
          tracking_id: trackingId,
          variant_id: null,
          ab_variant_letter: null,
        });

      if (trackingError) {
        console.error("Error creating tracking record:", trackingError);
      }

      // Construct the tracking pixel URL
      const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?id=${trackingId}`;

      // Build digest email
      const notificationsList = notifications
        .slice(0, 10)
        .map(
          (n) => `
        <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 3px solid #667eea;">
          <p style="margin: 0 0 5px 0; font-weight: bold;">${n.subject}</p>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${n.content}</p>
          ${
            n.metadata?.thread_id
              ? `<a href="${appUrl}/courses/${n.metadata.course_slug}?tab=discussions&thread=${n.metadata.thread_id}" style="color: #667eea; text-decoration: none; font-size: 13px;">View →</a>`
              : ""
          }
        </div>
      `
        )
        .join("");

      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Titans Careers</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Discussion Digest</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #667eea; margin-top: 0;">Your ${pref.frequency === "daily" ? "Daily" : "Weekly"} Discussion Digest</h2>
              
              <p style="color: #4b5563;">You have <strong>${notifications.length}</strong> new notification${notifications.length !== 1 ? "s" : ""}:</p>
              
              <ul style="color: #6b7280; padding-left: 20px;">
                ${replyCount > 0 ? `<li><strong>${replyCount}</strong> new ${replyCount === 1 ? "reply" : "replies"} to your discussions</li>` : ""}
                ${mentionCount > 0 ? `<li><strong>${mentionCount}</strong> ${mentionCount === 1 ? "mention" : "mentions"}</li>` : ""}
              </ul>
              
              <h3 style="color: #374151; margin-top: 30px;">Recent Notifications:</h3>
              
              ${notificationsList}
              
              ${
                notifications.length > 10
                  ? `<p style="color: #6b7280; font-style: italic; margin-top: 20px;">...and ${notifications.length - 10} more</p>`
                  : ""
              }
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <div style="text-align: center; padding: 20px 0;">
                <a href="${supabaseUrl.replace("https://gfmhhnynyxvmekhvytgg.supabase.co", "https://your-app-domain.com")}/courses" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  View All Discussions
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 15px 0;">
                <a href="${supabaseUrl.replace("https://gfmhhnynyxvmekhvytgg.supabase.co", "https://your-app-domain.com")}/profile?tab=notifications" style="color: #667eea; text-decoration: none; margin-right: 15px;">
                  📧 Manage Email Preferences
                </a>
                <span style="color: #d1d5db;">|</span>
                <a href="${supabaseUrl.replace("https://gfmhhnynyxvmekhvytgg.supabase.co", "https://your-app-domain.com")}/profile?tab=notifications&action=unsubscribe_digest" style="color: #9ca3af; text-decoration: none; margin-left: 15px;">
                  🔕 Unsubscribe from Digests
                </a>
              </p>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 10px 0;">
                You're receiving this ${pref.frequency} digest based on your notification preferences.
              </p>

              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 5px 0;">
                ${userData.user.email}
              </p>
            </div>
            <img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:block;border:0;outline:none;" />
          </body>
        </html>
      `;

      // Send email
      const emailResponse = await resend.emails.send({
        from: "Titans Careers <notifications@resend.dev>",
        to: [userData.user.email],
        subject: `Your ${pref.frequency === "daily" ? "Daily" : "Weekly"} Discussion Digest - ${notifications.length} New Notifications`,
        html: emailHtml,
      });

      console.log(`Email sent to ${userData.user.email}:`, emailResponse);

      // Mark notifications as sent
      const { error: updateError } = await supabase
        .from("queued_email_notifications")
        .update({ sent: true })
        .eq("user_id", pref.user_id)
        .eq("sent", false);

      if (updateError) throw updateError;

      // Update last_digest_sent_at
      const { error: prefUpdateError } = await supabase
        .from("email_notification_preferences")
        .update({ last_digest_sent_at: now.toISOString() })
        .eq("user_id", pref.user_id);

      if (prefUpdateError) throw prefUpdateError;

      sentCount++;
    }

    console.log(`Digest process complete. Sent ${sentCount} emails.`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in digest email process:", error);
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
