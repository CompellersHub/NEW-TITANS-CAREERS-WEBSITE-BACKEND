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
            .order("createdAt", { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq("status", status);
        }

        if (category) {
            query = query.eq("category", category);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
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
