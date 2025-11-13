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

interface TemplateStats {
  template_id: string;
  template_name: string;
  variant_letter: string;
  sends_count: number;
  opens_count: number;
  clicks_count: number;
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
    console.log("Starting automated nurture A/B winner selection");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all A/B test performance data for nurture campaigns
    const { data: performanceData, error: perfError } = await supabase
      .from("template_performance")
      .select("*")
      .eq("is_ab_test", true)
      .eq("campaign_type", "nurture")
      .not("ab_test_name", "is", null);

    if (perfError) throw perfError;

    if (!performanceData || performanceData.length === 0) {
      console.log("No A/B tests found for nurture campaigns");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No A/B tests to evaluate" 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group by A/B test name
    const testGroups: Record<string, TemplateStats[]> = performanceData.reduce((acc, item) => {
      const testName = item.ab_test_name!;
      if (!acc[testName]) {
        acc[testName] = [];
      }
      acc[testName].push({
        template_id: item.template_id!,
        template_name: item.template_name!,
        variant_letter: item.variant_letter || "A",
        sends_count: Number(item.sends_count || 0),
        opens_count: Number(item.opens_count || 0),
        clicks_count: Number(item.clicks_count || 0),
        open_rate: Number(item.open_rate || 0),
        click_rate: Number(item.click_rate || 0),
        combined_score: Number(item.open_rate || 0) * 0.6 + Number(item.click_rate || 0) * 0.4,
      });
      return acc;
    }, {} as Record<string, TemplateStats[]>);

    const results = [];

    // Analyze each A/B test
    for (const [testName, variants] of Object.entries(testGroups)) {
      if (variants.length < 2) {
        console.log(`Test ${testName} has only one variant, skipping`);
        continue;
      }

      // Check if all variants have minimum sample size
      const allHaveMinSample = variants.every(v => v.sends_count >= MIN_SAMPLE_SIZE);
      
      if (!allHaveMinSample) {
        console.log(`Test ${testName} doesn't have enough data yet`);
        results.push({
          test_name: testName,
          status: "insufficient_data",
          message: `Need at least ${MIN_SAMPLE_SIZE} sends per variant`,
          variants: variants.map(v => ({
            name: `${v.template_name} (${v.variant_letter})`,
            sends: v.sends_count
          }))
        });
        continue;
      }

      // Sort by combined score
      variants.sort((a, b) => b.combined_score - a.combined_score);
      const bestVariant = variants[0];
      const variantsToDeactivate: string[] = [];

      console.log(`Analyzing test ${testName}:`);
      console.log(`Best performer: ${bestVariant.template_name} (${bestVariant.variant_letter}) with score ${bestVariant.combined_score.toFixed(3)}`);

      // Compare best variant against all others
      let hasSignificantWin = false;
      
      for (let i = 1; i < variants.length; i++) {
        const competitor = variants[i];
        
        // Check if best variant is statistically significantly better
        const openRateSignificant = isStatisticallySignificant(
          bestVariant.open_rate / 100,
          bestVariant.sends_count,
          competitor.open_rate / 100,
          competitor.sends_count
        );

        const clickRateSignificant = isStatisticallySignificant(
          bestVariant.click_rate / 100,
          bestVariant.sends_count,
          competitor.click_rate / 100,
          competitor.sends_count
        );

        console.log(`Comparing vs ${competitor.template_name} (${competitor.variant_letter}):`);
        console.log(`  Open rate significant: ${openRateSignificant}`);
        console.log(`  Click rate significant: ${clickRateSignificant}`);

        // Deactivate if best is significantly better in at least one metric
        if ((openRateSignificant || clickRateSignificant) && bestVariant.combined_score > competitor.combined_score) {
          variantsToDeactivate.push(competitor.template_id);
          hasSignificantWin = true;
          console.log(`  -> Marking ${competitor.template_name} (${competitor.variant_letter}) for deactivation`);
        }
      }

      // Deactivate underperforming variants if we have a clear winner
      if (hasSignificantWin && variantsToDeactivate.length > 0) {
        const { error: deactivateError } = await supabase
          .from("email_templates")
          .update({ is_active: false })
          .in("id", variantsToDeactivate);

        if (deactivateError) {
          console.error(`Error deactivating variants for ${testName}:`, deactivateError);
          throw deactivateError;
        }

        console.log(`✓ Deactivated ${variantsToDeactivate.length} underperforming variants for ${testName}`);

        results.push({
          test_name: testName,
          status: "winner_selected",
          winner: {
            template_id: bestVariant.template_id,
            name: `${bestVariant.template_name} (${bestVariant.variant_letter})`,
            open_rate: bestVariant.open_rate,
            click_rate: bestVariant.click_rate,
            combined_score: bestVariant.combined_score,
            sends: bestVariant.sends_count,
          },
          deactivated_count: variantsToDeactivate.length,
        });
      } else {
        console.log(`No statistically significant winner yet for ${testName}`);
        results.push({
          test_name: testName,
          status: "no_significant_winner",
          message: "Differences not statistically significant yet",
          leader: {
            name: `${bestVariant.template_name} (${bestVariant.variant_letter})`,
            score: bestVariant.combined_score,
          }
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "A/B test winner selection completed",
        evaluated_tests: Object.keys(testGroups).length,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in select-nurture-ab-winner function:", error);
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
