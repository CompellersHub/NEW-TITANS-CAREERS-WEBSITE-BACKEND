import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntegrationRequest {
  action: "generate_token" | "verify_token" | "sync_progress";
  email?: string;
  token?: string;
  courseSlug?: string;
  progress?: number;
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

    const { action, email, token, courseSlug, progress }: IntegrationRequest = await req.json();

    switch (action) {
      case "generate_token": {
        if (!email) {
          return new Response(
            JSON.stringify({ error: "Email is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Generate unique token
        const newToken = btoa(`${email}:${Date.now()}:${Math.random()}`);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        const { error } = await supabase.from("integration_tokens").insert({
          email,
          token: newToken,
          expires_at: expiresAt.toISOString(),
        });

        if (error) throw error;

        return new Response(
          JSON.stringify({
            token: newToken,
            expiresAt: expiresAt.toISOString(),
            ssoUrl: `https://academy.titanscareers.com/sso?token=${newToken}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "verify_token": {
        if (!token) {
          return new Response(
            JSON.stringify({ error: "Token is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data, error } = await supabase
          .from("integration_tokens")
          .select("*")
          .eq("token", token)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (error || !data) {
          return new Response(
            JSON.stringify({ valid: false, error: "Invalid or expired token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            valid: true,
            email: data.email,
            academyUserId: data.academy_user_id,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "sync_progress": {
        if (!email || !courseSlug) {
          return new Response(
            JSON.stringify({ error: "Email and courseSlug are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Track progress sync
        await supabase.from("user_behaviors").insert({
          email,
          behavior_type: "academy_progress_sync",
          score_value: 0,
          behavior_data: {
            course: courseSlug,
            progress: progress || 0,
            synced_at: new Date().toISOString(),
          },
        });

        return new Response(
          JSON.stringify({ success: true, message: "Progress synced successfully" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Integration error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
