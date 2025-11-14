import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email client detection function
function detectEmailClient(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('outlook')) return 'Outlook';
  if (ua.includes('apple mail') || (ua.includes('applewebkit') && ua.includes('mobile'))) return 'Apple Mail';
  if (ua.includes('thunderbird')) return 'Thunderbird';
  if (ua.includes('gmail')) return 'Gmail';
  if (ua.includes('yahoo')) return 'Yahoo Mail';
  if (ua.includes('aol')) return 'AOL Mail';
  if (ua.includes('windows mail')) return 'Windows Mail';
  if (ua.includes('spark')) return 'Spark';
  if (ua.includes('airmail')) return 'Airmail';
  if (ua.includes('edison')) return 'Edison Mail';
  
  // Device-based detection
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS Mail';
  if (ua.includes('android')) return 'Android Mail';
  
  return 'Unknown';
}

interface TrackingParams {
  email: string;
  link_type: string; // 'preferences', 'unsubscribe_digest', 'unsubscribe_all'
  email_type: string; // 'digest', 'instant_notification'
  user_id?: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const linkType = url.searchParams.get("link_type");
    const emailType = url.searchParams.get("email_type");
    const userId = url.searchParams.get("user_id");
    const redirectTo = url.searchParams.get("redirect_to") || "/profile?tab=notifications";

    if (!email || !linkType || !emailType) {
      return new Response("Missing required parameters", { status: 400 });
    }

    console.log("Tracking email link click:", { email, linkType, emailType });

    // Get user agent and detect email client
    const userAgent = req.headers.get("user-agent") || "unknown";
    const emailClient = detectEmailClient(userAgent);

    // Insert tracking record
    const { error: trackingError } = await supabase
      .from("email_engagement_tracking")
      .insert({
        user_id: userId || null,
        email,
        link_type: linkType,
        email_type: emailType,
        user_agent: userAgent,
        metadata: {
          timestamp: new Date().toISOString(),
          email_client: emailClient,
        },
      });

    if (trackingError) {
      console.error("Error tracking email link:", trackingError);
    }

    // Handle unsubscribe actions
    if (linkType === "unsubscribe_digest" || linkType === "unsubscribe_all") {
      // Find user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (!userError && userData?.users) {
        const user = userData.users.find((u) => u.email === email);
        
        if (user) {
          // Update preferences
          const updates: any = {};
          
          if (linkType === "unsubscribe_digest") {
            updates.frequency = "instant"; // Disable digest, keep instant
          } else if (linkType === "unsubscribe_all") {
            updates.reply_notifications = false;
            updates.mention_notifications = false;
          }
          
          const { error: prefError } = await supabase
            .from("email_notification_preferences")
            .upsert({
              user_id: user.id,
              ...updates,
            });

          if (prefError) {
            console.error("Error updating preferences:", prefError);
          } else {
            console.log("Successfully unsubscribed user:", email);
          }
        }
      }
    }

    // Build app URL for redirect
    const appUrl = Deno.env.get("APP_URL") || "https://your-domain.com";
    const fullRedirectUrl = `${appUrl}${redirectTo}${redirectTo.includes("?") ? "&" : "?"}action=${linkType}`;

    // Redirect to the app
    return new Response(null, {
      status: 302,
      headers: {
        Location: fullRedirectUrl,
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in track-email-link:", error);
    
    // Still redirect even if tracking fails
    const appUrl = Deno.env.get("APP_URL") || "https://your-domain.com";
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/profile?tab=notifications`,
        ...corsHeaders,
      },
    });
  }
};

serve(handler);
