import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const slug = url.searchParams.get("slug");

        if (!slug) {
            return errorResponse("Course slug is required", 400);
        }

        // Make direct REST API call to Supabase using SERVICE_ROLE_KEY
        // This bypasses any Authorization header from the incoming request
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const response = await fetch(
            `${supabaseUrl}/rest/v1/courses?slug=eq.${encodeURIComponent(slug)}&limit=1`,
            {
                headers: {
                    "apikey": serviceRoleKey,
                    "Authorization": `Bearer ${serviceRoleKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error fetching course by slug:", errorText);
            return errorResponse("Failed to fetch course", response.status);
        }

        const courses = await response.json();

        if (!courses || courses.length === 0) {
            return errorResponse("Course not found", 404);
        }

        return jsonResponse({ course: courses[0] });
    } catch (error: any) {
        console.error("Error in get-course-by-slug:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);

