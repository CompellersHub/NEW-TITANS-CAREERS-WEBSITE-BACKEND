import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscriber {
  email: string;
  name: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId } = await req.json();
    
    if (!testId) {
      throw new Error("Test ID is required");
    }

    console.log(`Sending winner for A/B test: ${testId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Get A/B test details with winner
    const { data: abTest, error: testError } = await supabase
      .from("ab_tests")
      .select(`
        *,
        winner:ab_test_variants!winner_variant_id (
          id,
          variant_name,
          subject,
          html_content,
          preview_text
        )
      `)
      .eq("id", testId)
      .single();

    if (testError || !abTest) {
      throw new Error("A/B test not found");
    }

    if (abTest.status !== "completed") {
      throw new Error("A/B test is not completed yet");
    }

    if (!abTest.winner_variant_id || !abTest.winner) {
      throw new Error("No winner selected for this test");
    }

    const winner = Array.isArray(abTest.winner) ? abTest.winner[0] : abTest.winner;

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("active", true);

    if (subscribersError || !subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found");
    }

    // Calculate how many already received the test
    const testPercentage = abTest.test_percentage;
    const testSize = Math.floor((subscribers.length * testPercentage) / 100);
    
    // Send to remaining subscribers (those who didn't receive the test)
    const recipients = subscribers.slice(testSize).map((sub: Subscriber) => ({
      email: sub.email,
      name: sub.name || sub.email,
    }));

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "All subscribers already received the test",
          testId 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending winning variant to ${recipients.length} remaining subscribers`);

    // Send via Brevo in batches of 50
    const batchSize = 50;
    let totalSent = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: "Titans Careers",
            email: "noreply@titanscareer.com",
          },
          to: batch,
          subject: winner.subject,
          htmlContent: winner.html_content,
          textContent: winner.preview_text || winner.subject,
        }),
      });

      const brevoResult = await brevoResponse.json();
      
      if (!brevoResponse.ok) {
        console.error("Brevo API error:", brevoResult);
        throw new Error(`Brevo API error: ${JSON.stringify(brevoResult)}`);
      }

      totalSent += batch.length;
      console.log(`Sent batch ${Math.floor(i / batchSize) + 1}, total sent: ${totalSent}`);
    }

    // Record the winner campaign
    await supabase
      .from("email_campaigns")
      .insert({
        campaign_type: abTest.campaign_type,
        subject: winner.subject,
        content_key: `ab_test_${testId}_winner`,
        recipient_count: totalSent,
        success_count: totalSent,
        failure_count: 0,
        metadata: {
          ab_test_id: testId,
          variant_name: winner.variant_name,
          is_winner: true,
        },
      });

    // Update test status
    await supabase
      .from("ab_tests")
      .update({
        status: "sent",
      })
      .eq("id", testId);

    console.log("Winner sent successfully to all remaining subscribers");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Winner sent successfully",
        testId,
        variantName: winner.variant_name,
        subject: winner.subject,
        recipientCount: totalSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-ab-winner function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
