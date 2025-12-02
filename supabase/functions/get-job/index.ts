import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return errorResponse("Job ID is required", 400);
        }

        const { data: job, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("_id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return errorResponse("Job not found", 404);
            }
            console.error("Error fetching job:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({ job });
    } catch (error: any) {
        console.error("Error in get-job:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
