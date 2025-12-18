// JWT Token Generation and Verification Utilities

import { create, verify, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

interface JWTPayload {
    sub: string; // user id
    email: string;
    role: string;
    username?: string;
    exp: number;
    iat: number;
}

/**
 * Generate a JWT token for authenticated user
 */
export async function generateToken(
    userId: string,
    email: string,
    role: string,
    username?: string,
    expirationHours: number = 24
): Promise<string> {
    // Debug: Log all environment variables
    console.log("Available env vars:", Object.keys(Deno.env.toObject()));

    // Try to get JWT_SECRET, handling potential whitespace/newline issues
    let jwtSecret = Deno.env.get("JWT_SECRET");

    // If not found, try with newline (Supabase sometimes adds \n to env var names)
    if (!jwtSecret) {
        jwtSecret = Deno.env.get("JWT_SECRET\n");
    }

    // Trim any whitespace from the value itself
    if (jwtSecret) {
        jwtSecret = jwtSecret.trim();
    }

    console.log("JWT_SECRET value:", jwtSecret ? "Found (length: " + jwtSecret.length + ")" : "NOT FOUND");

    if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
    }

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );

    const payload: JWTPayload = {
        sub: userId,
        email,
        role,
        username,
        iat: getNumericDate(0),
        exp: getNumericDate(expirationHours * 60 * 60), // hours to seconds
    };

    return await create({ alg: "HS256", typ: "JWT" }, payload, key);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
    // Try to get JWT_SECRET, handling potential whitespace/newline issues
    let jwtSecret = Deno.env.get("JWT_SECRET");

    // If not found, try with newline (Supabase sometimes adds \n to env var names)
    if (!jwtSecret) {
        jwtSecret = Deno.env.get("JWT_SECRET\n");
    }

    // Trim any whitespace from the value itself
    if (jwtSecret) {
        jwtSecret = jwtSecret.trim();
    }

    if (!jwtSecret) {
        throw new Error("JWT_SECRET not configured");
    }

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(jwtSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );

    const payload = await verify(token, key);
    return payload as JWTPayload;
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return null;
    }

    return parts[1];
}
