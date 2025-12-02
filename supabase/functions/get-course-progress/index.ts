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
        const userId = url.searchParams.get("user_id");
        const courseId = url.searchParams.get("course_id");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
            .from("course_progress")
            .select("*")
            .order("last_updated", { ascending: false })
            .range(offset, offset + limit - 1);

        if (userId) {
            query = query.eq("user_id", userId);
        }

        if (courseId) {
            query = query.eq("course_id", courseId);
        }

        const { data: progress, error, count } = await query;

        if (error) {
            console.error("Error fetching course progress:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            progress,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-course-progress:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
