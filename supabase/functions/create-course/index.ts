import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { checkAdmin } from "../_shared/auth.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
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

        // Basic validation
        if (!body.title) {
            return errorResponse("Title is required", 400);
        }

        const { data, error } = await supabase
            .from("courses")
            .insert(body)
            .select()
            .single();

        if (error) {
            console.error("Error creating course:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse(data, 201);
    } catch (error: any) {
        console.error("Error in create-course:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
