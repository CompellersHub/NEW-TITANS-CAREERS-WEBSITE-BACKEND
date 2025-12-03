import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { openApiSpec } from "./openapi-spec.ts";

/**
 * Swagger UI HTML template with embedded OpenAPI specification
 */
const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Titans Careers API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
    .swagger-ui .info {
      margin: 20px 0;
    }
    .swagger-ui .info .title {
      color: #1e3a5f;
      font-size: 36px;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.5/swagger-ui-standalone-preset.js" charset="UTF-8"></script>
  <script>
    // Fix: Use DOMContentLoaded instead of window.onload
    document.addEventListener('DOMContentLoaded', function() {
      const spec = ${JSON.stringify(openApiSpec, null, 2)};
      
      // Fix: Make sure SwaggerUIStandalonePreset is available
      const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset;
      
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
    });
  </script>
</body>
</html>
`;

/**
 * Main handler for Swagger UI endpoint
 */
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Serve OpenAPI spec as JSON if requested
  if (url.pathname.endsWith("/openapi.json") || url.searchParams.get("format") === "json") {
    return new Response(JSON.stringify(openApiSpec, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  // Serve Swagger UI HTML with FIXED CSP headers
  return new Response(swaggerHtml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      // FIXED CSP: Added frame-src and relaxed script-src
      "Content-Security-Policy": "default-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; frame-src 'self'; connect-src 'self' https://*.supabase.co;",
      // This is also important for Supabase
      "X-Frame-Options": "SAMEORIGIN"
    },
  });
};

serve(handler);