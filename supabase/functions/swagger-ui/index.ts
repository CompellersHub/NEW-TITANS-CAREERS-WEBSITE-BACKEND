import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { openApiSpec } from "./openapi-spec.ts";

/**
 * Swagger UI Edge Function
 * Serves interactive API documentation for all Titans Careers API endpoints
 * 
 * Routes:
 * - GET / - Serves the Swagger UI HTML interface
 * - GET /openapi.json - Returns the OpenAPI specification in JSON format
 * - OPTIONS * - Handles CORS preflight requests
 */

// Embedded HTML template (avoids file loading issues in Deno Deploy)
const swaggerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Titans Careers API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #1e3a5f; font-size: 36px; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js"></script>
  <script>
    fetch('./openapi.json')
      .then(response => response.json())
      .then(spec => {
        window.ui = SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true
        });
      })
      .catch(error => {
        console.error('Error loading OpenAPI spec:', error);
        document.getElementById('swagger-ui').innerHTML = 
          '<h3>Error loading documentation. Please check console.</h3>';
      });
  </script>
</body>
</html>`;

/**
 * Main request handler
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    console.log(`📥 ${req.method} ${pathname}`);

    // Route: OpenAPI JSON specification
    if (pathname.endsWith("/openapi.json") || url.searchParams.get("format") === "json") {
      console.log("📄 Serving OpenAPI specification");
      return new Response(JSON.stringify(openApiSpec, null, 2), {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      });
    }

    // Route: Swagger UI HTML interface
    if (req.method === "GET") {
      console.log("🎨 Serving Swagger UI interface");

      return new Response(swaggerHtml, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      });
    }

    // Unsupported method
    console.warn(`⚠️ Method not allowed: ${req.method}`);
    return errorResponse(`Method ${req.method} not allowed`, 405);

  } catch (error: any) {
    console.error("❌ Error in swagger-ui handler:", error);
    return errorResponse(
      error.message || "Internal server error",
      500
    );
  }
};

// Start the server
console.log("🚀 Swagger UI function starting...");
serve(handler);