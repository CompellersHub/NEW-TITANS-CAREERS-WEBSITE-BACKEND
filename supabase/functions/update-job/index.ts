import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { checkAdmin } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "PUT") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Verify Admin
        const isAdmin = await checkAdmin(req, supabase);
        if (!isAdmin) {
            return errorResponse("Unauthorized: Admin access required", 401);
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return errorResponse("Job ID is required", 400);
        }

        const { data, error } = await supabase
            .from("jobs")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating job:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse(data);
    } catch (error: any) {
        console.error("Error in update-job:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
