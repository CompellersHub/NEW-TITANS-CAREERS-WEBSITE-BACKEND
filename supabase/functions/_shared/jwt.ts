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

    const jwtSecret = Deno.env.get("JWT_SECRET");
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
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const jwtSecret = Deno.env.get("JWT_SECRET");

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
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
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
