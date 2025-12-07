import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { generateToken } from "../_shared/jwt.ts";

interface RegisterRequest {
    email: string;
    password: string;
    username: string;
    userType: "customusers" | "bloguser" | "teacherprofiles";
    firstName?: string;
    lastName?: string;
    role?: string;
}

/**
 * Hash password using Django's PBKDF2 format
 */
async function hashDjangoPassword(password: string): Promise<string> {
    const iterations = 260000; // Django 3.2+ default
    const salt = generateSalt(12);

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const saltData = encoder.encode(salt);

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        passwordData,
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltData,
            iterations: iterations,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );

    const hash = btoa(String.fromCharCode(...new Uint8Array(derivedBits)));

    return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

/**
 * Generate random salt for password hashing
 */
function generateSalt(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);

    let salt = '';
    for (let i = 0; i < length; i++) {
        salt += chars[randomBytes[i] % chars.length];
    }
    return salt;
}

const handler = async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return errorResponse("Method not allowed", 405);
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body: RegisterRequest = await req.json();
        const { email, password, username, userType, firstName, lastName, role } = body;

        // Validate required fields
        if (!email || !password || !username || !userType) {
            return errorResponse("Email, password, username, and userType are required", 400);
        }

        if (!["customusers", "bloguser", "teacherprofiles"].includes(userType)) {
            return errorResponse("userType must be 'customusers', 'bloguser', or 'teacherprofiles'", 400);
        }

        // Check if email already exists in any table
        const { data: existingCustomUser } = await supabase
            .from("customusers")
            .select("id")
            .or(`email.eq.${email},data->>email.eq.${email}`)
            .limit(1);

        const { data: existingBlogUser } = await supabase
            .from("bloguser")
            .select("id")
            .or(`email.eq.${email},data->>email.eq.${email}`)
            .limit(1);

        const { data: existingTeacher } = await supabase
            .from("teacherprofiles")
            .select("id")
            .or(`email.eq.${email},data->>email.eq.${email}`)
            .limit(1);

        if ((existingCustomUser && existingCustomUser.length > 0) ||
            (existingBlogUser && existingBlogUser.length > 0) ||
            (existingTeacher && existingTeacher.length > 0)) {
            return errorResponse("Email already registered", 409);
        }

        // Hash password using Django PBKDF2
        const hashedPassword = await hashDjangoPassword(password);

        // Prepare user data
        const now = new Date().toISOString();
        const userData: any = {
            email,
            username,
            password: hashedPassword,
            role: role || (userType === "customusers" ? "user" : userType === "bloguser" ? "user" : "teacher"),
            created_at: now,
            data: {
                email,
                username,
                password: hashedPassword,
                role: role || (userType === "customusers" ? "user" : userType === "bloguser" ? "user" : "teacher"),
                created_at: now,
            }
        };

        // Add optional fields
        if (firstName) {
            userData.first_name = firstName;
            userData.data.first_name = firstName;
        }
        if (lastName) {
            userData.last_name = lastName;
            userData.data.last_name = lastName;
        }

        // Insert user into appropriate table
        const { data: newUser, error: insertError } = await supabase
            .from(userType)
            .insert(userData)
            .select()
            .single();

        if (insertError) {
            console.error("Error creating user:", insertError);
            return errorResponse(insertError.message, 500);
        }

        // Generate JWT token
        const token = await generateToken(
            newUser.id,
            email,
            userData.role,
            username
        );

        return jsonResponse({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: newUser.id,
                email,
                username,
                role: userData.role,
                userType,
            }
        }, 201);

    } catch (error: any) {
        console.error("Error in register:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
