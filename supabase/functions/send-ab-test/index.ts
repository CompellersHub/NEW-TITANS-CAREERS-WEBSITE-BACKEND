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

    console.log(`Starting A/B test send for test ID: ${testId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Get A/B test details
    const { data: abTest, error: testError } = await supabase
      .from("ab_tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError || !abTest) {
      throw new Error("A/B test not found");
    }

    if (abTest.status !== "draft") {
      throw new Error("A/B test is not in draft status");
    }

    // Get test variants
    const { data: variants, error: variantsError } = await supabase
      .from("ab_test_variants")
      .select("*")
      .eq("ab_test_id", testId);

    if (variantsError || !variants || variants.length < 2) {
      throw new Error("A/B test must have at least 2 variants");
    }

    console.log(`Found ${variants.length} variants for test`);

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("active", true);

    if (subscribersError || !subscribers || subscribers.length === 0) {
      throw new Error("No active subscribers found");
    }

    // Calculate test sample size
    const testPercentage = abTest.test_percentage;
    const testSize = Math.floor((subscribers.length * testPercentage) / 100);
    const perVariant = Math.floor(testSize / variants.length);

    console.log(`Total subscribers: ${subscribers.length}, Test size: ${testSize}, Per variant: ${perVariant}`);

    // Shuffle subscribers and split for each variant
    const shuffled = [...subscribers].sort(() => Math.random() - 0.5);
    
    // Send emails for each variant
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const variantSubscribers = shuffled.slice(i * perVariant, (i + 1) * perVariant);
      
      if (variantSubscribers.length === 0) continue;

      const recipients = variantSubscribers.map((sub: Subscriber) => ({
        email: sub.email,
        name: sub.name || sub.email,
      }));

      console.log(`Sending variant ${variant.variant_name} to ${recipients.length} subscribers`);

      // Send via Brevo
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
          to: recipients.slice(0, 50),
          subject: variant.subject,
          htmlContent: variant.html_content,
          textContent: variant.preview_text || variant.subject,
        }),
      });

      const brevoResult = await brevoResponse.json();
      
      if (!brevoResponse.ok) {
        console.error("Brevo API error:", brevoResult);
        throw new Error(`Brevo API error: ${JSON.stringify(brevoResult)}`);
      }

      console.log(`Variant ${variant.variant_name} sent successfully`);

      // Record results
      await supabase
        .from("ab_test_results")
        .insert({
          ab_test_id: testId,
          variant_id: variant.id,
          sent_count: recipients.length,
          open_count: 0,
          click_count: 0,
          unsubscribe_count: 0,
        });
    }

    // Update test status
    await supabase
      .from("ab_tests")
      .update({
        status: "running",
        started_at: new Date().toISOString(),
      })
      .eq("id", testId);

    console.log("A/B test sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "A/B test sent successfully",
        testId,
        variantCount: variants.length,
        totalSent: perVariant * variants.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-ab-test function:", error);
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
