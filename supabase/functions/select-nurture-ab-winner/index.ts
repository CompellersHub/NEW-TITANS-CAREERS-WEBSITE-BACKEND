import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    // Get template auto_winner_paused status
    const { data: templatesData } = await supabase
      .from("email_templates")
      .select("id, ab_test_name, auto_winner_paused")
      .eq("is_ab_test", true)
      .eq("campaign_type", "nurture");

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
    let totalWinnersSelected = 0;

    // Get admin users for email notifications
    const { data: adminUsers } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        auth.users!inner(email)
      `)
      .eq("role", "admin");

    const adminEmails = adminUsers
      ?.map((u: any) => u.users?.email)
      .filter(Boolean) || [];

    console.log(`Found ${adminEmails.length} admin users for notifications`);

    // Analyze each A/B test
    for (const [testName, variants] of Object.entries(testGroups)) {
      if (variants.length < 2) {
        console.log(`Test ${testName} has only one variant, skipping`);
        continue;
      }

      // Check if auto winner selection is paused for this test
      const isPaused = templatesData?.some(
        t => t.ab_test_name === testName && t.auto_winner_paused === true
      );

      if (isPaused) {
        console.log(`Auto winner selection is paused for ${testName}, skipping`);
        results.push({
          test_name: testName,
          status: "paused",
          message: "Automated winner selection is paused by admin",
        });
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

        // Calculate improvement percentage
        const improvementPercent = variants.length > 1 
          ? (((bestVariant.combined_score - variants[1].combined_score) / variants[1].combined_score) * 100)
          : 0;

        // Get deactivated variants info
        const deactivatedVariantsInfo = variants
          .filter(v => variantsToDeactivate.includes(v.template_id))
          .map(v => ({
            template_id: v.template_id,
            template_name: v.template_name,
            variant_letter: v.variant_letter,
            open_rate: v.open_rate,
            click_rate: v.click_rate,
            combined_score: v.combined_score,
            sends_count: v.sends_count
          }));

        // Log to history table
        const { error: historyError } = await supabase
          .from("ab_test_winner_history")
          .insert({
            ab_test_name: testName,
            campaign_type: "nurture",
            winner_template_id: bestVariant.template_id,
            winner_template_name: bestVariant.template_name,
            winner_variant_letter: bestVariant.variant_letter,
            winner_open_rate: bestVariant.open_rate,
            winner_click_rate: bestVariant.click_rate,
            winner_combined_score: bestVariant.combined_score,
            winner_sends_count: bestVariant.sends_count,
            improvement_percent: improvementPercent,
            deactivated_variants_count: variantsToDeactivate.length,
            deactivated_variants: deactivatedVariantsInfo,
            selected_by: "automated"
          });

        if (historyError) {
          console.error(`Error logging winner to history for ${testName}:`, historyError);
          // Don't throw - logging failure shouldn't stop the process
        }

        totalWinnersSelected++;

        const resultData = {
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
        };

        results.push(resultData);

        // Send email notification to admins
        if (resend && adminEmails.length > 0) {
          try {

            const emailHtml = `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>A/B Test Winner Selected</title>
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🏆 A/B Test Winner Selected!</h1>
                  </div>
                  
                  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Test: ${testName}</h2>
                      
                      <div style="margin: 20px 0; padding: 15px; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">
                        <p style="margin: 0; font-size: 16px; font-weight: bold; color: #2e7d32;">
                          ✓ Winner: ${bestVariant.template_name} (${bestVariant.variant_letter})
                        </p>
                      </div>

                      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background: #f5f5f5;">
                          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Metric</th>
                          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Value</th>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #eee;">Open Rate</td>
                          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">${bestVariant.open_rate.toFixed(2)}%</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #eee;">Click Rate</td>
                          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">${bestVariant.click_rate.toFixed(2)}%</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #eee;">Combined Score</td>
                          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee; font-weight: bold;">${(bestVariant.combined_score * 100).toFixed(2)}%</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px; border-bottom: 1px solid #eee;">Total Sends</td>
                          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${bestVariant.sends_count}</td>
                        </tr>
                        <tr style="background: #fff3e0;">
                          <td style="padding: 12px; font-weight: bold;">Improvement</td>
                          <td style="padding: 12px; text-align: right; font-weight: bold; color: #f57c00;">+${improvementPercent.toFixed(1)}%</td>
                        </tr>
                      </table>

                      <div style="margin: 20px 0; padding: 15px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #e65100;">
                          <strong>Action Taken:</strong> ${variantsToDeactivate.length} underperforming variant${variantsToDeactivate.length !== 1 ? 's' : ''} ${variantsToDeactivate.length !== 1 ? 'have' : 'has'} been automatically deactivated. The winning variant is now receiving 100% of traffic.
                        </p>
                      </div>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                      <p style="color: #666; font-size: 14px; margin: 5px 0;">
                        This is an automated notification from your A/B testing system.
                      </p>
                      <p style="color: #999; font-size: 12px; margin: 5px 0;">
                        Statistical significance was achieved with 95% confidence.
                      </p>
                    </div>
                  </div>
                </body>
              </html>
            `;

            await resend.emails.send({
              from: "A/B Testing System <onboarding@resend.dev>",
              to: adminEmails,
              subject: `🏆 A/B Test Winner: ${testName}`,
              html: emailHtml,
            });

            console.log(`✓ Email notifications sent to ${adminEmails.length} admin(s)`);
          } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail the entire function if email fails
          }
        }
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
        winners_selected: totalWinnersSelected,
        notifications_sent: totalWinnersSelected > 0 && resend && adminEmails.length > 0,
        admin_count: adminEmails.length,
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
