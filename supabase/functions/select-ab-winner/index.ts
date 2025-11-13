import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testId } = await req.json();
    
    if (!testId) {
      throw new Error("Test ID is required");
    }

    console.log(`Selecting winner for A/B test: ${testId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get A/B test details
    const { data: abTest, error: testError } = await supabase
      .from("ab_tests")
      .select("*")
      .eq("id", testId)
      .single();

    if (testError || !abTest) {
      throw new Error("A/B test not found");
    }

    if (abTest.status !== "running") {
      throw new Error("A/B test is not in running status");
    }

    // Get test results with variant details
    const { data: results, error: resultsError } = await supabase
      .from("ab_test_results")
      .select(`
        *,
        ab_test_variants (
          id,
          variant_name,
          subject,
          html_content,
          preview_text
        )
      `)
      .eq("ab_test_id", testId);

    if (resultsError || !results || results.length === 0) {
      throw new Error("No results found for this test");
    }

    console.log(`Found ${results.length} variants with results`);

    // Calculate performance score for each variant
    // Score = (open_rate * 0.6) + (click_rate * 0.4)
    const variantScores = results.map(result => ({
      ...result,
      score: (result.open_rate * 0.6) + (result.click_rate * 0.4),
    }));

    // Sort by score descending
    variantScores.sort((a, b) => b.score - a.score);

    const winner = variantScores[0];

    console.log(`Winner is variant ${winner.ab_test_variants.variant_name} with score ${winner.score.toFixed(2)}`);

    // Update test with winner
    await supabase
      .from("ab_tests")
      .update({
        status: "completed",
        winner_variant_id: winner.variant_id,
        completed_at: new Date().toISOString(),
        metadata: {
          winner_score: winner.score,
          all_scores: variantScores.map(v => ({
            variant_name: v.ab_test_variants.variant_name,
            score: v.score,
            open_rate: v.open_rate,
            click_rate: v.click_rate,
          })),
        },
      })
      .eq("id", testId);

    // Auto-save winning variant as template
    console.log("Saving winning variant as template");
    
    try {
      await supabase
        .from("email_templates")
        .insert({
          name: `${abTest.name} - Winner (${winner.ab_test_variants.variant_name})`,
          description: `Winning variant from A/B test with ${winner.score.toFixed(2)} score`,
          campaign_type: abTest.campaign_type,
          subject: winner.ab_test_variants.subject,
          html_content: winner.ab_test_variants.html_content,
          preview_text: winner.ab_test_variants.preview_text,
          source_type: "ab_test_winner",
          source_id: testId,
          tags: ["ab-test-winner", "high-performing"],
        });
      
      console.log("Winner saved as template successfully");
    } catch (templateError: any) {
      console.error("Error saving winner as template:", templateError);
      // Don't fail the whole operation if template saving fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Winner selected successfully",
        winner: {
          variantId: winner.variant_id,
          variantName: winner.ab_test_variants.variant_name,
          subject: winner.ab_test_variants.subject,
          score: winner.score,
          openRate: winner.open_rate,
          clickRate: winner.click_rate,
        },
        allResults: variantScores.map(v => ({
          variantName: v.ab_test_variants.variant_name,
          score: v.score,
          openRate: v.open_rate,
          clickRate: v.click_rate,
          sentCount: v.sent_count,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in select-ab-winner function:", error);
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
