import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { verifyDjangoPassword } from "../_shared/django-password.ts";
import { generateToken } from "../_shared/jwt.ts";

interface LoginRequest {
    email: string;
    password: string;
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

        const contentType = req.headers.get("content-type") || "";
        console.log("Content-Type:", contentType);

        let body: LoginRequest;

        try {
            if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
                const formData = await req.formData();
                body = {
                    email: formData.get("email")?.toString() || "",
                    password: formData.get("password")?.toString() || ""
                };
            } else {
                // Default to JSON
                body = await req.json();
            }
        } catch (e: any) {
            console.error("Error parsing request body:", e);
            return errorResponse(`Invalid request body: ${e.message}`, 400);
        }

        const { email, password } = body;

        if (!email || !password) {
            return errorResponse("Email and password are required", 400);
        }

        // Try to find user in customusers table first
        let user = null;
        let userType = "";
        let passwordHash = "";

        // Check customusers table
        const { data: customUsers, error: customUsersError } = await supabase
            .from("customusers")
            .select("*")
            .or(`email.eq.${email},data->>email.eq.${email}`)
            .limit(1);

        if (!customUsersError && customUsers && customUsers.length > 0) {
            user = customUsers[0];
            userType = "customusers";
            passwordHash = user.password || user.data?.password;
        }

        // If not found, check bloguser table
        if (!user) {
            const { data: blogUsers, error: blogError } = await supabase
                .from("bloguser")
                .select("*")
                .or(`email.eq.${email},data->>email.eq.${email}`)
                .limit(1);

            if (!blogError && blogUsers && blogUsers.length > 0) {
                user = blogUsers[0];
                userType = "bloguser";
                passwordHash = user.password || user.data?.password;
            }
        }

        // If not found, check teacherprofiles table
        if (!user) {
            const { data: teachers, error: teacherError } = await supabase
                .from("teacherprofiles")
                .select("*")
                .or(`email.eq.${email},data->>email.eq.${email}`)
                .limit(1);

            if (!teacherError && teachers && teachers.length > 0) {
                user = teachers[0];
                userType = "teacherprofiles";
                passwordHash = user.password || user.data?.password;
            }
        }

        if (!user) {
            console.log(`User not found for email: ${email}`);
            return errorResponse("Invalid email or password (User not found)", 401);
        }

        if (!passwordHash) {
            console.log(`Password hash not found for user: ${user.id}`);
            return errorResponse("Invalid email or password (No password set)", 401);
        }

        // Verify password against Django hash
        console.log(`Verifying password for user ${user.id}...`);
        const isValidPassword = await verifyDjangoPassword(password, passwordHash);
        console.log(`Password verification result: ${isValidPassword}`);

        if (!isValidPassword) {
            console.log("Password verification failed");
            return errorResponse("Invalid email or password (Password mismatch)", 401);
        }

        // Extract user info
        const userId = user.id;
        const userEmail = user.email || user.data?.email;
        const username = user.username || user.data?.username;
        const role = user.role || user.data?.role || userType;

        // Generate JWT token (24 hour expiration)
        const token = await generateToken(userId, userEmail, role, username);

        // Update last login time
        const updateData: any = {};
        if (user.last_login !== undefined) {
            updateData.last_login = new Date().toISOString();
        } else if (user.data) {
            updateData.data = {
                ...user.data,
                last_login: new Date().toISOString()
            };
        }

        if (Object.keys(updateData).length > 0) {
            await supabase
                .from(userType)
                .update(updateData)
                .eq("id", userId);
        }

        return jsonResponse({
            success: true,
            token,
            user: {
                id: userId,
                email: userEmail,
                username,
                role,
                userType
            }
        });
    } catch (error: any) {
        console.error("Error in login:", error);
        return errorResponse(error.message || "Internal server error", 500);
    }
};

serve(handler);
