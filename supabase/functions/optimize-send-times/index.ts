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
    console.log("Starting send time optimization analysis");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get subscribers who need analysis (haven't been analyzed or analyzed > 7 days ago)
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select(`
        id,
        email,
        engagement_score,
        last_send_time_analysis
      `)
      .eq("active", true)
      .or(`last_send_time_analysis.is.null,last_send_time_analysis.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`)
      .limit(100); // Process in batches

    if (subError) throw subError;

    if (!subscribers || subscribers.length === 0) {
      console.log("No subscribers need analysis");
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers need analysis" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Analyzing ${subscribers.length} subscribers`);

    // Get engagement data for each subscriber
    const subscriberIds = subscribers.map(s => s.id);
    const { data: engagementData, error: engError } = await supabase
      .from("email_sends")
      .select("email, sent_at, opened_at, clicked_at")
      .in("email", subscribers.map(s => s.email))
      .not("opened_at", "is", null)
      .order("opened_at", { ascending: false })
      .limit(500);

    if (engError) throw engError;

    let updatedCount = 0;
    let failedCount = 0;

    // Process each subscriber
    for (const subscriber of subscribers) {
      try {
        const subscriberEngagement = engagementData?.filter(e => e.email === subscriber.email) || [];

        if (subscriberEngagement.length < 3) {
          // Not enough data - use default times based on general patterns
          await supabase
            .from("newsletter_subscribers")
            .update({
              optimal_send_hour: 9, // Default 9 AM
              optimal_send_day: "Tuesday",
              last_send_time_analysis: new Date().toISOString(),
            })
            .eq("id", subscriber.id);

          updatedCount++;
          continue;
        }

        // Prepare engagement pattern data for AI analysis
        const engagementPattern = subscriberEngagement.map(e => ({
          sent_at: e.sent_at,
          opened_at: e.opened_at,
          clicked_at: e.clicked_at,
          hour: new Date(e.opened_at).getHours(),
          day: new Date(e.opened_at).toLocaleDateString('en-US', { weekday: 'long' }),
          dayOfWeek: new Date(e.opened_at).getDay(),
        }));

        // Calculate basic statistics
        const hourCounts = engagementPattern.reduce((acc, e) => {
          acc[e.hour] = (acc[e.hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        const dayCounts = engagementPattern.reduce((acc, e) => {
          acc[e.day] = (acc[e.day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Use AI to analyze patterns and recommend optimal send time
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are an email marketing optimization expert. Analyze engagement patterns and recommend the optimal send time.
                
Consider:
- Hour of day when user is most active (0-23)
- Day of week when user is most likely to engage
- Patterns in open and click behavior
- Timezone considerations (assume UTC)

Respond with ONLY valid JSON in this exact format:
{
  "optimal_hour": <number 0-23>,
  "optimal_day": "<Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday>",
  "confidence": "<high|medium|low>",
  "reasoning": "<brief explanation>"
}`
              },
              {
                role: "user",
                content: `Analyze this subscriber's engagement pattern:

Engagement Score: ${subscriber.engagement_score || 0}
Total Engagements: ${engagementPattern.length}

Hour Distribution:
${Object.entries(hourCounts).sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any)).slice(0, 5).map(([h, c]) => `Hour ${h}: ${c} opens`).join('\n')}

Day Distribution:
${Object.entries(dayCounts).sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any)).map(([d, c]) => `${d}: ${c} opens`).join('\n')}

Recent Patterns (last 10):
${engagementPattern.slice(0, 10).map((e, i) => `${i + 1}. Opened at ${e.hour}:00 on ${e.day}`).join('\n')}

What is the optimal send time for this subscriber?`
              }
            ],
            temperature: 0.3,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI API error for ${subscriber.email}:`, aiResponse.status);
          failedCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices[0]?.message?.content || "";
        
        // Parse AI response
        let recommendation;
        try {
          // Extract JSON from markdown code blocks if present
          const jsonMatch = aiContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || 
                           aiContent.match(/(\{[\s\S]*\})/);
          const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
          recommendation = JSON.parse(jsonStr);
        } catch (e) {
          console.error(`Failed to parse AI response for ${subscriber.email}:`, aiContent);
          // Fallback to most common hour and day
          const mostCommonHour = parseInt(Object.entries(hourCounts).sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any))[0][0]);
          const mostCommonDay = Object.entries(dayCounts).sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any))[0][0];
          
          recommendation = {
            optimal_hour: mostCommonHour,
            optimal_day: mostCommonDay,
            confidence: "low",
            reasoning: "Fallback to statistical mode"
          };
        }

        // Update subscriber with optimal send time
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({
            optimal_send_hour: recommendation.optimal_hour,
            optimal_send_day: recommendation.optimal_day,
            last_send_time_analysis: new Date().toISOString(),
            metadata: {
              ...subscriber.metadata || {},
              send_time_optimization: {
                confidence: recommendation.confidence,
                reasoning: recommendation.reasoning,
                last_updated: new Date().toISOString(),
              }
            }
          })
          .eq("id", subscriber.id);

        if (updateError) {
          console.error(`Failed to update ${subscriber.email}:`, updateError);
          failedCount++;
        } else {
          console.log(`✓ Updated ${subscriber.email}: ${recommendation.optimal_hour}:00 on ${recommendation.optimal_day}`);
          updatedCount++;
        }

        // Rate limiting - small delay between AI calls
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    console.log(`Optimization complete: ${updatedCount} updated, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Send time optimization completed",
        updated_count: updatedCount,
        failed_count: failedCount,
        total_processed: subscribers.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in optimize-send-times function:", error);
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
