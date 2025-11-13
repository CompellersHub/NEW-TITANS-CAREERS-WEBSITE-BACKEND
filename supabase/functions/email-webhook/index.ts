import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Handle Brevo webhook format
    if (body.event) {
      const event = body.event;
      const email = body.email || event.email;
      const trackingId = body["message-id"] || body.tag;

      console.log(`Processing ${event} event for email: ${email}, tracking: ${trackingId}`);

      // Update email_sends table based on event
      if (event === "opened" || event === "open") {
        const { error: updateError } = await supabase
          .from("email_sends")
          .update({ opened_at: new Date().toISOString() })
          .or(`tracking_id.eq.${trackingId},email.eq.${email}`)
          .is("opened_at", null);

        if (updateError) {
          console.error("Error updating email open:", updateError);
        } else {
          console.log("Email open recorded");
          
          // Update engagement event
          const { data: sendData } = await supabase
            .from("email_sends")
            .select("email")
            .or(`tracking_id.eq.${trackingId},email.eq.${email}`)
            .single();

          if (sendData) {
            const { data: subscriber } = await supabase
              .from("newsletter_subscribers")
              .select("id")
              .eq("email", sendData.email)
              .single();

            if (subscriber) {
              await supabase.from("engagement_events").insert({
                subscriber_id: subscriber.id,
                event_type: "open",
                event_data: { tracking_id: trackingId }
              });

              // Update subscriber stats
              await supabase.rpc("update_all_engagement_scores");
            }
          }
        }
      } else if (event === "clicked" || event === "click") {
        const { error: updateError } = await supabase
          .from("email_sends")
          .update({ clicked_at: new Date().toISOString() })
          .or(`tracking_id.eq.${trackingId},email.eq.${email}`)
          .is("clicked_at", null);

        if (updateError) {
          console.error("Error updating email click:", updateError);
        } else {
          console.log("Email click recorded");

          // Update engagement event
          const { data: sendData } = await supabase
            .from("email_sends")
            .select("email")
            .or(`tracking_id.eq.${trackingId},email.eq.${email}`)
            .single();

          if (sendData) {
            const { data: subscriber } = await supabase
              .from("newsletter_subscribers")
              .select("id")
              .eq("email", sendData.email)
              .single();

            if (subscriber) {
              await supabase.from("engagement_events").insert({
                subscriber_id: subscriber.id,
                event_type: "click",
                event_data: { tracking_id: trackingId, link: body.link || body.url }
              });

              // Update lead score for high-value click
              await supabase.rpc("update_lead_score", {
                p_email: sendData.email,
                p_score_change: 15,
                p_behavior: "email_click"
              });

              // Update subscriber stats
              await supabase.rpc("update_all_engagement_scores");
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Webhook processed" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
