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

        // Parse query parameters
        const url = new URL(req.url);
        const status = url.searchParams.get("status") || "active";
        const type = url.searchParams.get("type");
        const location = url.searchParams.get("location");
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        // Build query
        let query = supabase
            .from("jobs")
            .select("*")
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters - check both direct columns and JSONB data field
        if (status === "active") {
            // Filter for active jobs in the JSONB data field
            query = query.or("type.eq.active,data->>is_active.eq.true");
        }

        if (type) {
            // Check both direct type column and JSONB data field
            query = query.or(`type.eq.${type},data->>type.eq.${type}`);
        }

        if (location) {
            // Check both direct location column and JSONB data field
            query = query.or(`location.ilike.%${location}%,data->>location.ilike.%${location}%`);
        }

        if (search) {
            // Search in both direct columns and JSONB data field
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%,data->>title.ilike.%${search}%,data->>description.ilike.%${search}%,data->>company_name.ilike.%${search}%`);
        }

        const { data: jobs, error, count } = await query;

        if (error) {
            console.error("Error fetching jobs:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            jobs,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-jobs:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
