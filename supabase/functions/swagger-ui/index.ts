import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { openApiSpec } from "./openapi-spec.ts";

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    // Serve OpenAPI JSON spec
    if (url.pathname.endsWith("/openapi.json")) {
        return new Response(JSON.stringify(openApiSpec, null, 2), {
            status: 200,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json; charset=utf-8",
            },
        });
    }

    // Main endpoint - return helpful JSON with links
    const specUrl = "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/swagger-ui/openapi.json";
    const swaggerEditorUrl = `https://editor.swagger.io/?url=${encodeURIComponent(specUrl)}`;
    const swaggerUIUrl = `https://petstore.swagger.io/?url=${encodeURIComponent(specUrl)}`;

    return new Response(JSON.stringify({
        title: "Titans Careers API Documentation",
        version: openApiSpec.info.version,
        description: openApiSpec.info.description,
        totalEndpoints: Object.keys(openApiSpec.paths).length,
        documentation: {
            openapi_spec: specUrl,
            swagger_editor: swaggerEditorUrl,
            swagger_ui_demo: swaggerUIUrl
        },
        instructions: [
            "1. Click 'swagger_editor' to view and test all API endpoints in Swagger Editor",
            "2. Click 'swagger_ui_demo' to view in Swagger UI's demo site",
            "3. Click 'openapi_spec' to download the raw OpenAPI JSON specification"
        ],
        note: "Due to Content Security Policy restrictions in Supabase Edge Functions, we redirect to external Swagger UI hosts."
    }, null, 2), {
        status: 200,
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json; charset=utf-8",
        },
    });
};

serve(handler);
