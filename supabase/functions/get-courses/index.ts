import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

interface CourseFilters {
    category?: string;
    level?: string;
    search?: string;
    limit?: number;
    offset?: number;
}

const handler = async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Parse query parameters
        const url = new URL(req.url);
        const category = url.searchParams.get("category");
        const level = url.searchParams.get("level");
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        // Build query
        let query = supabase
            .from("courses")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (category) {
            query = query.eq("category", category);
        }

        if (level) {
            query = query.eq("level", level);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: courses, error, count } = await query;

        if (error) {
            console.error("Error fetching courses:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            courses,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-courses:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
