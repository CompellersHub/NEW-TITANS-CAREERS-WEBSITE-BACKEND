import { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;

interface TrackingOptions {
  email?: string;
  enableAutoTracking?: boolean;
}

export function useBehaviorTracking({ email, enableAutoTracking = true }: TrackingOptions = {}) {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (!enableAutoTracking) return;

    const trackPageView = async () => {
      try {
        await sb.from("user_behaviors").insert({
          email: email || "anonymous",
          behavior_type: "page_view",
          score_value: 1,
          behavior_data: { path: location.pathname },
        });

        // Update lead score if email provided
        if (email) {
          await sb.rpc("update_lead_score", {
            p_email: email,
            p_score_change: 1,
            p_behavior: "page_view",
          });
        }
      } catch (error) {
        console.error("Tracking error:", error);
      }
    };

    trackPageView();
  }, [location.pathname, email, enableAutoTracking]);

  // Track specific behaviors
  const trackBehavior = useCallback(
    async (behaviorType: string, scoreValue: number = 5, behaviorData?: any) => {
      try {
        await sb.from("user_behaviors").insert({
          email: email || "anonymous",
          behavior_type: behaviorType,
          score_value: scoreValue,
          behavior_data: behaviorData,
        });

        // Update lead score if email provided
        if (email) {
          await sb.rpc("update_lead_score", {
            p_email: email,
            p_score_change: scoreValue,
            p_behavior: behaviorType,
          });
        }
      } catch (error) {
        console.error("Tracking error:", error);
      }
    },
    [email]
  );

  // Track course views
  const trackCourseView = useCallback(
    (courseSlug: string, courseName: string) => {
      trackBehavior("course_view", 10, { course: courseSlug, name: courseName });
    },
    [trackBehavior]
  );

  // Track CTA clicks
  const trackCTAClick = useCallback(
    (ctaType: string, ctaLocation: string) => {
      trackBehavior("cta_click", 15, { type: ctaType, location: ctaLocation });
    },
    [trackBehavior]
  );

  // Track video watches
  const trackVideoWatch = useCallback(
    (videoId: string, duration: number) => {
      trackBehavior("video_watch", 20, { video: videoId, duration });
    },
    [trackBehavior]
  );

  // Track downloads
  const trackDownload = useCallback(
    (resourceType: string, resourceId: string) => {
      trackBehavior("download", 25, { type: resourceType, id: resourceId });
    },
    [trackBehavior]
  );

  // Track course inquiries
  const trackCourseInquiry = useCallback(
    (courseSlug: string, inquiryType: string, email: string) => {
      trackBehavior("course_inquiry", 25, { 
        course: courseSlug, 
        type: inquiryType,
        email: email 
      });
    },
    [trackBehavior]
  );

  return {
    trackBehavior,
    trackCourseView,
    trackCTAClick,
    trackVideoWatch,
    trackDownload,
    trackCourseInquiry,
  };
}
