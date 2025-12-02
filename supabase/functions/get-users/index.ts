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
        const role = url.searchParams.get("role");
        const search = url.searchParams.get("search");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
            .from("users")
            .select("*")
            .order("user_id", { ascending: true })
            .range(offset, offset + limit - 1);

        if (role) {
            query = query.eq("role", role);
        }

        if (search) {
            query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data: users, error, count } = await query;

        if (error) {
            console.error("Error fetching users:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            users,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-users:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
