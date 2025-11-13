import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Minimum sample size per variant before making decisions
const MIN_SAMPLE_SIZE = 30;
// Confidence level for statistical significance (95% = 1.96)
const Z_SCORE_95 = 1.96;

interface VariantStats {
  variant_id: string;
  variant_name: string;
  total_sends: number;
  total_opens: number;
  total_clicks: number;
  open_rate: number;
  click_rate: number;
  combined_score: number;
}

// Calculate z-score for comparing two proportions
function calculateZScore(
  p1: number,
  n1: number,
  p2: number,
  n2: number
): number {
  const pooledP = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
  if (se === 0) return 0;
  return Math.abs(p1 - p2) / se;
}

// Check if difference is statistically significant
function isStatisticallySignificant(
  rate1: number,
  count1: number,
  rate2: number,
  count2: number
): boolean {
  const zScore = calculateZScore(rate1, count1, rate2, count2);
  return zScore >= Z_SCORE_95;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting automated email A/B winner selection");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active variants
    const { data: variants, error: variantsError } = await supabase
      .from("email_ab_variants")
      .select("*")
      .eq("is_active", true)
      .eq("email_type", "conversation_summary");

    if (variantsError) throw variantsError;

    if (!variants || variants.length < 2) {
      console.log("Not enough active variants for testing");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Not enough active variants for testing" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${variants.length} active variants`);

    // Get performance stats for each variant
    const { data: sends, error: sendsError } = await supabase
      .from("email_sends")
      .select("variant_id, opened_at, clicked_at")
      .in("variant_id", variants.map(v => v.id));

    if (sendsError) throw sendsError;

    // Calculate stats for each variant
    const statsMap = new Map<string, VariantStats>();
    
    variants.forEach(variant => {
      const variantSends = sends?.filter(s => s.variant_id === variant.id) || [];
      const totalSends = variantSends.length;
      const totalOpens = variantSends.filter(s => s.opened_at).length;
      const totalClicks = variantSends.filter(s => s.clicked_at).length;
      
      const openRate = totalSends > 0 ? totalOpens / totalSends : 0;
      const clickRate = totalSends > 0 ? totalClicks / totalSends : 0;
      // Combined score: 60% open rate + 40% click rate
      const combinedScore = openRate * 0.6 + clickRate * 0.4;

      statsMap.set(variant.id, {
        variant_id: variant.id,
        variant_name: variant.variant_name,
        total_sends: totalSends,
        total_opens: totalOpens,
        total_clicks: totalClicks,
        open_rate: openRate,
        click_rate: clickRate,
        combined_score: combinedScore,
      });
    });

    const stats = Array.from(statsMap.values());
    console.log("Variant stats:", JSON.stringify(stats, null, 2));

    // Check if all variants have minimum sample size
    const allHaveMinSample = stats.every(s => s.total_sends >= MIN_SAMPLE_SIZE);
    
    if (!allHaveMinSample) {
      console.log("Not all variants have minimum sample size yet");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Waiting for more data before making decisions",
          stats 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sort by combined score to find best performer
    stats.sort((a, b) => b.combined_score - a.combined_score);
    const bestVariant = stats[0];
    const variantsToDeactivate: string[] = [];

    console.log(`Best performer: ${bestVariant.variant_name} with score ${bestVariant.combined_score.toFixed(3)}`);

    // Compare best variant against all others
    for (let i = 1; i < stats.length; i++) {
      const competitor = stats[i];
      
      // Check if best variant is statistically significantly better
      const openRateSignificant = isStatisticallySignificant(
        bestVariant.open_rate,
        bestVariant.total_sends,
        competitor.open_rate,
        competitor.total_sends
      );

      const clickRateSignificant = isStatisticallySignificant(
        bestVariant.click_rate,
        bestVariant.total_sends,
        competitor.click_rate,
        competitor.total_sends
      );

      console.log(`Comparing ${bestVariant.variant_name} vs ${competitor.variant_name}:`);
      console.log(`  Open rate significant: ${openRateSignificant}`);
      console.log(`  Click rate significant: ${clickRateSignificant}`);

      // Deactivate if best is significantly better in at least one metric and not worse in the other
      if (openRateSignificant || clickRateSignificant) {
        if (bestVariant.combined_score > competitor.combined_score) {
          variantsToDeactivate.push(competitor.variant_id);
          console.log(`  -> Marking ${competitor.variant_name} for deactivation`);
        }
      }
    }

    // Deactivate underperforming variants
    if (variantsToDeactivate.length > 0) {
      const { error: deactivateError } = await supabase
        .from("email_ab_variants")
        .update({ is_active: false })
        .in("id", variantsToDeactivate);

      if (deactivateError) throw deactivateError;

      console.log(`Deactivated ${variantsToDeactivate.length} underperforming variants`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Winner selected and underperforming variants deactivated",
          winner: {
            variant_id: bestVariant.variant_id,
            variant_name: bestVariant.variant_name,
            combined_score: bestVariant.combined_score,
            open_rate: bestVariant.open_rate,
            click_rate: bestVariant.click_rate,
            total_sends: bestVariant.total_sends,
          },
          deactivated_count: variantsToDeactivate.length,
          all_stats: stats,
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "No statistically significant winner yet",
        stats,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in select-email-ab-winner function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString()
      }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
