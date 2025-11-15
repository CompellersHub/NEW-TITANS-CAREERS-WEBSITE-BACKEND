import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import { HeroSection } from "@/components/homepage/HeroSection";
import { PainTransformationSection } from "@/components/homepage/PainTransformationSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
import { PricingSection } from "@/components/homepage/PricingSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { courses } from "@/data/courses";
import { ExitIntentPopup } from "@/components/marketing/ExitIntentPopup";
import { SocialProofNotifications } from "@/components/marketing/SocialProofNotifications";
import { CourseFinder } from "@/components/marketing/CourseFinder";
import { LeadMagnetModal } from "@/components/marketing/LeadMagnetModal";
import { AICourseAdvisor } from "@/components/marketing/AICourseAdvisor";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { SEO } from "@/components/SEO";
import { organizationSchema } from "@/lib/structuredData";

const Index = () => {
  const coursesArray = Object.values(courses);
  const featuredCourses = coursesArray.slice(0, 3);
  const [showCourseFinder, setShowCourseFinder] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  useBehaviorTracking({ enableAutoTracking: true });
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();

  return (
    <PageTransition variant="default">
      <SEO 
        title="Titans Careers - Escape Low Pay & Land Remote High-Paying Jobs"
        description="Tired of low pay and job rejections? Transform your career with practical training in AML, Data Analysis, Cybersecurity & more. Get CV overhaul, interview prep & mentoring. 85% job placement rate. Flexible payment plans from £99/month."
        keywords="career change, remote jobs UK, high paying jobs, AML training, data analyst training, cybersecurity courses, career transformation, CV overhaul, job placement, flexible payment plans, online training courses"
        structuredData={organizationSchema}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <ExitIntentPopup />
        <SocialProofNotifications />
        <CourseFinder isOpen={showCourseFinder} onClose={() => setShowCourseFinder(false)} />
        <LeadMagnetModal isOpen={showLeadMagnet} onClose={() => setShowLeadMagnet(false)} />
        <ErrorBoundary fallback={null}>
          <AICourseAdvisor />
        </ErrorBoundary>
        
        <HeroSection />
        
        <PainTransformationSection />
        
        <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
                <span className="text-accent font-bold text-sm tracking-wide uppercase">
                  Professional Training
                </span>
              </div>
              
              <h2 className="font-kanit font-semibold text-primary mb-6" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
                High-Demand Roles We Prepare You For
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Each course combines practical projects, industry tools, CV transformation, and interview mastery
              </p>
            </div>
            
            <CourseGrid courses={featuredCourses} />
            
            <CourseGrid courses={featuredCourses} />
          </div>
        </section>
        
        <HowItWorksSection />
        <SuccessStoriesSection />
        <PricingSection />
        <FAQSection />
        
        <CTA />
        <Footer />
        <ScrollToTop />
        <KeyboardShortcutsHelper />
      </div>
    </PageTransition>
  );
};

export default Index;
