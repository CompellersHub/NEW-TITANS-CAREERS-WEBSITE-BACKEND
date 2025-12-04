// Middleware to verify JWT tokens in protected endpoints

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { errorResponse } from "./cors.ts";
import { verifyToken, extractToken } from "./jwt.ts";

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    username?: string;
}

/**
 * Verify JWT token from request and return user info
 * Returns null if token is invalid or missing
 */
export async function verifyAuthToken(req: Request): Promise<AuthenticatedUser | null> {
    const authHeader = req.headers.get("Authorization");
    const token = extractToken(authHeader);

    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return null;
    }

    return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        username: payload.username
    };
}

/**
 * Middleware wrapper for protected endpoints
 * Returns error response if authentication fails
 */
export async function requireAuth(req: Request): Promise<AuthenticatedUser | Response> {
    const user = await verifyAuthToken(req);

    if (!user) {
        return errorResponse("Unauthorized - Invalid or missing token", 401);
    }

    return user;
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role);
}

/**
 * Require specific role(s) for endpoint access
 */
export function requireRole(user: AuthenticatedUser, allowedRoles: string[]): Response | null {
    if (!hasRole(user, allowedRoles)) {
        return errorResponse(`Forbidden - Requires one of: ${allowedRoles.join(", ")}`, 403);
    }
    return null;
}
