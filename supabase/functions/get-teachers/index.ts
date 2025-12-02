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
        const isVerified = url.searchParams.get("is_verified");
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
            .from("teacherprofiles")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (isVerified !== null) {
            query = query.eq("is_verified", isVerified === "true");
        }

        if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,bio.ilike.%${search}%`);
        }

        const { data: teachers, error, count } = await query;

        if (error) {
            console.error("Error fetching teachers:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            teachers,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-teachers:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
