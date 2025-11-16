import { useState } from "react";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { FreeSessionBookingDialog } from "@/components/FreeSessionBookingDialog";

interface FloatingCourseCTAProps {
  courseSlug: string;
  courseTitle: string;
}

export function FloatingCourseCTA({ courseSlug, courseTitle }: FloatingCourseCTAProps) {
  const { trackCTAClick, trackBehavior } = useBehaviorTracking();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <FreeSessionBookingDialog />
    </div>
  );
}
