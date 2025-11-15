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
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { KeyboardShortcutsHelper } from "@/components/ui/keyboard-shortcuts-helper";
import { courses } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ExitIntentPopup } from "@/components/marketing/ExitIntentPopup";
import { SocialProofNotifications } from "@/components/marketing/SocialProofNotifications";
import { CourseFinder } from "@/components/marketing/CourseFinder";
import { LeadMagnetModal } from "@/components/marketing/LeadMagnetModal";
import { ReferralProgram } from "@/components/marketing/ReferralProgram";
import { AICourseAdvisor } from "@/components/marketing/AICourseAdvisor";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Sparkles, Download } from "lucide-react";
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
        title="Titans Training Group - Professional Training Courses"
        description="Transform your career with practical training courses from Titans Training Group. Learn AML/KYC, Data Analysis, Cybersecurity, and more with hands-on projects. 85% job placement rate."
        keywords="training courses, professional development, career change, AML training, KYC certification, data analysis courses, cybersecurity training, compliance training, tech training"
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
        
        <section className="py-20 md:py-28 px-4 bg-secondary relative overflow-hidden">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
                <span className="text-accent font-bold text-sm tracking-wide uppercase">
                  Professional Training
                </span>
              </div>
              
              <h2 className="font-kanit font-semibold text-primary mb-6" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
                Our Flagship Courses
              </h2>
              
              <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Start your career transformation today with our industry-leading programs
              </p>
            </div>
            
            <CourseGrid courses={featuredCourses} />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 animate-slide-up">
              <Button 
                size="lg" 
                variant="default" 
                className="font-bold"
                onClick={() => setShowCourseFinder(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Find Your Perfect Course
              </Button>
              <Link to="/courses">
                <Button size="lg" variant="outline" className="font-bold">
                  View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-16 px-4 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-background rounded-2xl shadow-xl p-8 md:p-12 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <Download className="h-8 w-8 text-accent" />
              </div>
              <h2 className="font-kanit font-semibold text-primary text-3xl md:text-4xl">
                Free Career Resources
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Download our proven career guides, roadmaps, and toolkits to kickstart your journey
              </p>
              <Button 
                size="lg" 
                onClick={() => setShowLeadMagnet(true)}
                className="font-bold"
              >
                <Download className="mr-2 h-5 w-5" />
                Get Free Resources
              </Button>
            </div>
          </div>
        </section>
        
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        
        <div id="success-stories">
          <SuccessStoriesSection />
        </div>
        
        <div id="faqs">
          <FAQSection />
        </div>
        
        <section className="py-16 px-4 bg-secondary">
          <div className="container mx-auto max-w-2xl">
            <ReferralProgram />
          </div>
        </section>
        
        <NewsletterSection />
        
        <CTA />
        <Footer />
        <ScrollToTop />
        <KeyboardShortcutsHelper />
      </div>
    </PageTransition>
  );
};

export default Index;
