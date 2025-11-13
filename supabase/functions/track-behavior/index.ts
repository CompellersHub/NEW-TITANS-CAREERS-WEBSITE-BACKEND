import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BehaviorData {
  email: string;
  behaviorType: string;
  scoreValue?: number;
  behaviorData?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { email, behaviorType, scoreValue = 5, behaviorData }: BehaviorData = await req.json();

    if (!email || !behaviorType) {
      return new Response(
        JSON.stringify({ error: "Email and behaviorType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Track the behavior
    await supabase.from("user_behaviors").insert({
      email,
      behavior_type: behaviorType,
      score_value: scoreValue,
      behavior_data: behaviorData,
    });

    // Update lead score
    await supabase.rpc("update_lead_score", {
      p_email: email,
      p_score_change: scoreValue,
      p_behavior: behaviorType,
    });

    // Check if we should trigger automated follow-ups
    const { data: leadData } = await supabase
      .from("lead_scores")
      .select("total_score, status")
      .eq("email", email)
      .single();

    let triggeredActions: string[] = [];

    // Trigger follow-up based on score milestones
    if (leadData) {
      if (leadData.total_score >= 100 && leadData.status === "hot") {
        // Hot lead - send personalized consultation offer
        triggeredActions.push("hot_lead_consultation");
      } else if (leadData.total_score >= 50 && leadData.status === "warm") {
        // Warm lead - send case studies
        triggeredActions.push("warm_lead_case_studies");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        score: leadData?.total_score || 0,
        status: leadData?.status || "cold",
        triggeredActions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error tracking behavior:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
