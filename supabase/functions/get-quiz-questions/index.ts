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
        const quizId = url.searchParams.get("quiz_id");
        const type = url.searchParams.get("type");
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const offset = parseInt(url.searchParams.get("offset") || "0");

        let query = supabase
            .from("quiz_questions")
            .select("*")
            .order("createdAt", { ascending: false })
            .range(offset, offset + limit - 1);

        if (quizId) {
            query = query.eq("quizId", quizId);
        }

        if (type) {
            query = query.eq("type", type);
        }

        const { data: questions, error, count } = await query;

        if (error) {
            console.error("Error fetching quiz questions:", error);
            return errorResponse(error.message, 500);
        }

        return jsonResponse({
            questions,
            total: count,
            limit,
            offset,
        });
    } catch (error: any) {
        console.error("Error in get-quiz-questions:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
