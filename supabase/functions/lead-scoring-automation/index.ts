import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Automated lead scoring and nurturing
 * This function runs periodically to identify and act on lead score changes
 */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all leads that became hot in the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: hotLeads } = await supabase
      .from("lead_scores")
      .select("*")
      .eq("status", "hot")
      .gte("last_activity", twentyFourHoursAgo.toISOString());

    // Get leads that are warming up (50-99 points)
    const { data: warmLeads } = await supabase
      .from("lead_scores")
      .select("*")
      .eq("status", "warm")
      .gte("last_activity", twentyFourHoursAgo.toISOString());

    // Get their recent behaviors
    const results = {
      hot: [] as any[],
      warm: [] as any[],
    };

    // Process hot leads
    for (const lead of hotLeads || []) {
      const { data: behaviors } = await supabase
        .from("user_behaviors")
        .select("*")
        .eq("email", lead.email)
        .order("created_at", { ascending: false })
        .limit(10);

      // Determine which courses they're most interested in
      const courseInterests: Record<string, number> = {};
      behaviors?.forEach((b) => {
        if (b.behavior_data?.course) {
          courseInterests[b.behavior_data.course] = 
            (courseInterests[b.behavior_data.course] || 0) + b.score_value;
        }
      });

      const topCourse = Object.entries(courseInterests)
        .sort(([, a], [, b]) => b - a)[0]?.[0];

      results.hot.push({
        email: lead.email,
        name: lead.name,
        score: lead.total_score,
        topCourse,
        action: "send_consultation_offer",
      });
    }

    // Process warm leads
    for (const lead of warmLeads || []) {
      const { data: behaviors } = await supabase
        .from("user_behaviors")
        .select("*")
        .eq("email", lead.email)
        .order("created_at", { ascending: false })
        .limit(10);

      const hasWatchedVideo = behaviors?.some((b) => b.behavior_type === "video_watch");
      const hasDownloadedResource = behaviors?.some((b) => b.behavior_type === "lead_magnet_download");

      results.warm.push({
        email: lead.email,
        name: lead.name,
        score: lead.total_score,
        action: hasWatchedVideo
          ? "send_success_stories"
          : hasDownloadedResource
          ? "send_course_guide"
          : "send_value_content",
      });
    }

    // Here you would integrate with your email service (Brevo) to send automated emails
    // For now, we'll just log the actions that should be taken
    console.log("Hot leads to follow up:", results.hot);
    console.log("Warm leads to nurture:", results.warm);

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          hot: results.hot.length,
          warm: results.warm.length,
        },
        actions: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Lead scoring automation error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
