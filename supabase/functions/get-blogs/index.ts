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
        const category = url.searchParams.get("category");
        const status = url.searchParams.get("status") || "published";
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
            .from("blogs")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            // Check both direct status column and JSONB data field
            query = query.or(`status.eq.${status},data->>status.eq.${status}`);
        }

        if (category) {
            // Check both direct category column and JSONB data field
            query = query.or(`category.eq.${category},data->>category.eq.${category}`);
        }

        if (search) {
            // Search in both direct columns and JSONB data field
            query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%,data->>title.ilike.%${search}%,data->>excerpt.ilike.%${search}%,data->>content.ilike.%${search}%`);
        }

        const { data: blogs, error, count } = await query;

        if (error) {
            console.error("Error fetching blogs:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            blogs,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-blogs:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
