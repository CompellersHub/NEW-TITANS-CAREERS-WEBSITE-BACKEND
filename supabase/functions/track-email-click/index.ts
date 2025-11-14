import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const trackingId = url.searchParams.get("id");
  const targetUrl = url.searchParams.get("url");

  if (!trackingId || !targetUrl) {
    return new Response("Missing parameters", {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the email_sends record to mark as clicked
    const { error: sendError } = await supabase
      .from("email_sends")
      .update({ clicked_at: new Date().toISOString() })
      .eq("tracking_id", trackingId)
      .is("clicked_at", null); // Only update if not already clicked

    if (sendError) {
      console.error("Error tracking email click:", sendError);
    } else {
      console.log(`Email clicked: ${trackingId}`);
    }

    // Update voucher distribution record if exists
    const { error: distError } = await supabase
      .from("voucher_distributions")
      .update({ 
        clicked_at: new Date().toISOString(),
        status: 'clicked'
      })
      .eq("tracking_id", trackingId)
      .is("clicked_at", null);

    if (distError) {
      console.error("Error updating voucher distribution:", distError);
    }

    // Try to find subscriber and record engagement event
    const { data: sendData } = await supabase
      .from("email_sends")
      .select("email")
      .eq("tracking_id", trackingId)
      .single();

    if (sendData?.email) {
      const { data: subscriber } = await supabase
        .from("newsletter_subscribers")
        .select("id")
        .eq("email", sendData.email)
        .single();

      if (subscriber) {
        await supabase.from("engagement_events").insert({
          subscriber_id: subscriber.id,
          event_type: "click",
          event_data: { tracking_id: trackingId, target_url: targetUrl }
        });

        // Update engagement scores
        await supabase.rpc("update_all_engagement_scores");
      }
    }
  } catch (error) {
    console.error("Error in track-email-click:", error);
  }

  // Redirect to the target URL
  return new Response(null, {
    status: 302,
    headers: {
      ...corsHeaders,
      "Location": decodeURIComponent(targetUrl),
    },
  });
});
