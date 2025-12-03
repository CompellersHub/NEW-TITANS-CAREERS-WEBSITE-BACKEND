import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { openApiSpec } from "./openapi-spec.ts";

// Read the HTML file
const swaggerHtml = await Deno.readTextFile(new URL('./swagger.html', import.meta.url));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  if (url.pathname.endsWith("/openapi.json")) {
    return new Response(JSON.stringify(openApiSpec, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }

  return new Response(swaggerHtml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
};

serve(handler);