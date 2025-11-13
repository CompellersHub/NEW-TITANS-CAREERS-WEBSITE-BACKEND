import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { NewsletterSection } from "@/components/NewsletterSection";
import { courses } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExitIntentPopup } from "@/components/marketing/ExitIntentPopup";
import { SocialProofNotifications } from "@/components/marketing/SocialProofNotifications";
import { CourseFinder } from "@/components/marketing/CourseFinder";
import { LeadMagnetModal } from "@/components/marketing/LeadMagnetModal";
import { ReferralProgram } from "@/components/marketing/ReferralProgram";
import { AICourseAdvisor } from "@/components/marketing/AICourseAdvisor";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { Sparkles, Download } from "lucide-react";

const Index = () => {
  const coursesArray = Object.values(courses);
  const featuredCourses = coursesArray.slice(0, 3);
  const [showCourseFinder, setShowCourseFinder] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  // Track behavior on this page
  useBehaviorTracking({ enableAutoTracking: true });

  return (
    <PageTransition variant="default">
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Marketing Automation Features */}
        <ExitIntentPopup />
        <SocialProofNotifications />
        <CourseFinder isOpen={showCourseFinder} onClose={() => setShowCourseFinder(false)} />
        <LeadMagnetModal isOpen={showLeadMagnet} onClose={() => setShowLeadMagnet(false)} />
        <AICourseAdvisor />
        
        <HeroSection />
        
        {/* Featured Courses Section */}
        <section className="py-20 md:py-28 px-4 bg-secondary relative overflow-hidden">
...
        
        <CTA />
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
