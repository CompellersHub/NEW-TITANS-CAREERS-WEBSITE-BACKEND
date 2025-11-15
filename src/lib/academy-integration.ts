import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;

/**
 * Integration utilities for connecting with Titans Academy
 * This prepares the infrastructure for seamless SSO and data sync
 */

export interface AcademyUser {
  email: string;
  academyUserId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Generate integration token for Titans Academy
 */
export async function generateAcademyToken(email: string): Promise<string> {
  const token = btoa(`${email}:${Date.now()}:${Math.random()}`);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  const { error } = await sb.from("integration_tokens").insert({
    email,
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  return token;
}

/**
 * Verify token from Titans Academy
 */
export async function verifyAcademyToken(token: string): Promise<AcademyUser | null> {
  const { data, error } = await sb
    .from("integration_tokens")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) return null;

  return {
    email: data.email,
    academyUserId: data.academy_user_id || "",
    token: data.token,
    expiresAt: new Date(data.expires_at),
  };
}

/**
 * Sync user progress to Titans Academy
 */
export async function syncProgressToAcademy(
  email: string,
  courseSlug: string,
  progress: number
): Promise<void> {
  // Track the sync attempt
  await sb.from("user_behaviors").insert({
    email,
    behavior_type: "academy_sync",
    score_value: 0,
    behavior_data: {
      course: courseSlug,
      progress,
      timestamp: new Date().toISOString(),
    },
  });

  // TODO: When Titans Academy is ready, implement actual API call here
  console.log("Progress sync prepared for:", { email, courseSlug, progress });
}

/**
 * Create SSO link to Titans Academy
 */
export async function createAcademySSOLink(email: string): Promise<string> {
  const token = await generateAcademyToken(email);
  
  // Use environment variable or default to placeholder
  // Set VITE_ACADEMY_DOMAIN in production with actual Titans Academy domain
  const academyDomain = import.meta.env.VITE_ACADEMY_DOMAIN || "https://academy.titanscareers.com";
  return `${academyDomain}/sso?token=${token}`;
}

/**
 * Enhanced SSO link creation with activity logging
 */
export async function createSecureAcademySSOLink(
  userId: string,
  email: string,
  metadata?: any
): Promise<string> {
  try {
    // Generate secure token
    const token = await generateAcademyToken(email);
    
    // Log the LMS access attempt
    await sb.from("user_activity_log").insert({
      user_id: userId,
      email: email,
      activity_type: "lms_access",
      description: "Accessed learning platform via SSO",
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });

    // Track behavior for analytics
    await sb.from("user_behaviors").insert({
      email,
      behavior_type: "lms_access",
      score_value: 5,
      behavior_data: {
        timestamp: new Date().toISOString(),
        source: "profile_page"
      },
    });
    
    // Create SSO link with return URL
    const academyDomain = import.meta.env.VITE_ACADEMY_DOMAIN || 
      "https://academy.titanscareers.com";
    return `${academyDomain}/sso?token=${token}&return_to=dashboard`;
  } catch (error) {
    console.error("Error creating SSO link:", error);
    throw error;
  }
}

/**
 * Log user activity (generic function for any activity type)
 */
export async function logUserActivity(
  userId: string,
  email: string,
  activityType: string,
  description?: string,
  metadata?: any
): Promise<void> {
  try {
    await sb.from("user_activity_log").insert({
      user_id: userId,
      email: email,
      activity_type: activityType,
      description: description,
      metadata: metadata || {}
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't throw - activity logging should not break the main flow
  }
}
