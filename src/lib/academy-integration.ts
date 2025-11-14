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
 * Track user enrollment for Academy sync
 */
export async function trackEnrollment(
  email: string,
  courseSlug: string,
  courseName: string
): Promise<void> {
  await sb.from("user_behaviors").insert({
    email,
    behavior_type: "course_enrollment",
    score_value: 50,
    behavior_data: {
      course: courseSlug,
      name: courseName,
      enrolled_at: new Date().toISOString(),
    },
  });

  // Update lead score to "customer"
  await sb
    .from("lead_scores")
    .update({ status: "customer" })
    .eq("email", email);
}
