import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

// Email client detection function
function detectEmailClient(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('outlook')) return 'Outlook';
  if (ua.includes('apple mail') || ua.includes('applewebkit') && ua.includes('mobile')) return 'Apple Mail';
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

serve(async (req) => {
  const url = new URL(req.url);
  const trackingId = url.searchParams.get("id");

  if (!trackingId) {
    return new Response(TRACKING_PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Detect email client from user agent
    const userAgent = req.headers.get("user-agent") || "unknown";
    const emailClient = detectEmailClient(userAgent);

    // Update the email_sends record to mark as opened with email client info
    const { error } = await supabase
      .from("email_sends")
      .update({ 
        opened_at: new Date().toISOString(),
      })
      .eq("tracking_id", trackingId)
      .is("opened_at", null); // Only update if not already opened
    
    // Log email client info separately in engagement tracking
    if (!error) {
      const { data: emailSendData } = await supabase
        .from("email_sends")
        .select("email")
        .eq("tracking_id", trackingId)
        .single();

      if (emailSendData) {
        await supabase
          .from("email_engagement_tracking")
          .insert({
            email: emailSendData.email,
            link_type: "email_open",
            email_type: "tracking_pixel",
            user_agent: userAgent,
            metadata: {
              email_client: emailClient,
            },
          });
      }
    }

    if (error) {
      console.error("Error tracking email open:", error);
    } else {
      console.log(`Email opened: ${trackingId}`);
    }
  } catch (error) {
    console.error("Error in track-email-open:", error);
  }

  // Always return the tracking pixel
  return new Response(TRACKING_PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
});
