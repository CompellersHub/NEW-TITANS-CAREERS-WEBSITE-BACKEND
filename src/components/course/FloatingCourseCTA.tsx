import { useState } from "react";
import { MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseInquiryDialog } from "./CourseInquiryDialog";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";

interface FloatingCourseCTAProps {
  courseSlug: string;
  courseTitle: string;
}

export function FloatingCourseCTA({ courseSlug, courseTitle }: FloatingCourseCTAProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { trackCTAClick, trackBehavior } = useBehaviorTracking();

  const handleButtonClick = () => {
    trackCTAClick("floating_course_cta", `course_${courseSlug}`);
    trackBehavior("dialog_opened", 5, { course: courseSlug, type: "inquiry_dialog" });
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Button
          onClick={handleButtonClick}
          size="lg"
          className="h-14 px-6 rounded-full shadow-2xl hover:shadow-accent/50 bg-gradient-to-r from-accent via-primary to-gold hover:scale-105 transition-all duration-300 group relative overflow-hidden"
        >
          {/* Animated pulse ring */}
          <span className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
          
          {/* Icons */}
          <Calendar className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          
          {/* Text */}
          <span className="font-semibold relative z-10">
            Free Session or Join Group
          </span>
        </Button>
      </div>

      <CourseInquiryDialog
        courseSlug={courseSlug}
        courseTitle={courseTitle}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
