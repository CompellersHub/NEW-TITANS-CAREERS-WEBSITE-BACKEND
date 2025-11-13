import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing scheduled voucher campaigns...");

    // Get all campaigns that are due to be sent
    const { data: campaigns, error: campaignsError } = await supabase
      .from("scheduled_voucher_campaigns")
      .select("*")
      .eq("status", "scheduled")
      .lte("next_send_at", new Date().toISOString());

    if (campaignsError) {
      throw new Error(`Error fetching campaigns: ${campaignsError.message}`);
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("No campaigns due for sending");
      return new Response(
        JSON.stringify({ message: "No campaigns to process", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${campaigns.length} campaigns to process`);

    const results = [];

    for (const campaign of campaigns) {
      try {
        console.log(`Processing campaign ${campaign.id}`);

        // Call send-voucher-email function
        const { data: sendResult, error: sendError } = await supabase.functions.invoke(
          "send-voucher-email",
          {
            body: {
              voucherId: campaign.voucher_id,
              recipients: campaign.manual_emails || [],
              segmentId: campaign.segment_id,
              subject: campaign.subject,
              message: campaign.message,
            },
          }
        );

        if (sendError) {
          throw sendError;
        }

        console.log(`Campaign ${campaign.id} sent successfully`);

        // Update campaign status
        const updateData: any = {
          last_sent_at: new Date().toISOString(),
        };

        // If non-recurring, mark as sent
        if (campaign.recurrence_type === "none") {
          updateData.status = "sent";
        } else {
          // For recurring campaigns, calculate next send time
          const now = new Date();
          let nextSend = new Date(now);

          switch (campaign.recurrence_type) {
            case "daily":
              nextSend.setDate(nextSend.getDate() + 1);
              break;
            case "weekly":
              nextSend.setDate(nextSend.getDate() + 7);
              break;
            case "monthly":
              nextSend.setMonth(nextSend.getMonth() + 1);
              break;
          }

          updateData.next_send_at = nextSend.toISOString();
        }

        const { error: updateError } = await supabase
          .from("scheduled_voucher_campaigns")
          .update(updateData)
          .eq("id", campaign.id);

        if (updateError) {
          console.error(`Error updating campaign ${campaign.id}:`, updateError);
        }

        results.push({
          campaignId: campaign.id,
          success: true,
          recipientCount: sendResult?.totalSent || 0,
        });
      } catch (error: any) {
        console.error(`Error processing campaign ${campaign.id}:`, error);

        // Mark campaign as failed
        await supabase
          .from("scheduled_voucher_campaigns")
          .update({ status: "failed" })
          .eq("id", campaign.id);

        results.push({
          campaignId: campaign.id,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Campaigns processed",
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in process-scheduled-campaigns function:", error);
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
