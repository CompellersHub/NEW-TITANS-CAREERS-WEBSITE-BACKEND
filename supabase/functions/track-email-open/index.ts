import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

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

    // Update the email_sends record to mark as opened
    const { error } = await supabase
      .from("email_sends")
      .update({ opened_at: new Date().toISOString() })
      .eq("tracking_id", trackingId)
      .is("opened_at", null); // Only update if not already opened

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
