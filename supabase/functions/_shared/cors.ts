/**
 * Shared CORS configuration for all Supabase Edge Functions
 * Allows requests from any origin with common headers
 */

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Handle CORS preflight requests
 * @returns Response with CORS headers for OPTIONS requests
 */
export function handleCorsPrelight(): Response {
    return new Response(null, { headers: corsHeaders });
}

/**
 * Create a JSON response with CORS headers
 * @param data - Data to serialize as JSON
 * @param status - HTTP status code (default: 200)
 * @returns Response with JSON content and CORS headers
 */
export function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
        },
    });
}

/**
 * Create an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @returns Response with error JSON and CORS headers
 */
export function errorResponse(message: string, status: number = 500): Response {
    return jsonResponse({ error: message }, status);
}
