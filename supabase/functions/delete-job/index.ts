import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { checkAdmin } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "DELETE") {
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

        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return errorResponse("Job ID is required", 400);
        }

        const { error } = await supabase
            .from("jobs")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting job:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({ message: "Job deleted successfully" });
    } catch (error: any) {
        console.error("Error in delete-job:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
