import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth-middleware.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    // Verify authentication
    const authResult = await requireAuth(req);

    // If authResult is a Response, it means authentication failed
    if (authResult instanceof Response) {
        return authResult;
    }

    // authResult is the authenticated user
    const user = authResult;

    return jsonResponse({
        message: "You are authenticated!",
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        }
    });
};

serve(handler);
