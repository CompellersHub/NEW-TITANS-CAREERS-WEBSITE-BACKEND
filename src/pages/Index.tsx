import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { PageLayout } from "@/components/layouts/PageLayout";
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
import { Sparkles, Download, BookOpen } from "lucide-react";
import { SEO } from "@/components/SEO";
import { organizationSchema } from "@/lib/structuredData";
import { UpcomingEvents } from "@/components/homepage/UpcomingEvents";
import { CompanyLogosCarousel } from "@/components/homepage/CompanyLogosCarousel";
import { ToolsCarousel } from "@/components/homepage/ToolsCarousel";
import { StatsInfographic } from "@/components/infographics/StatsInfographic";
import { ProcessInfographic } from "@/components/infographics/ProcessInfographic";
import { LazyInfographic } from "@/components/infographics/LazyInfographic";
import { TrendingUp, Target, Award, Users } from "lucide-react";

const Index = () => {
  const coursesArray = Object.values(courses);
  const featuredCourses = coursesArray.slice(0, 3);
  const [showCourseFinder, setShowCourseFinder] = useState(false);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);

  useBehaviorTracking({ enableAutoTracking: true });
  
  // Enable keyboard shortcuts
  useNavigationShortcuts();

  const statsData = [
    { value: 300, label: "Career Switchers", prefix: "", suffix: "+", color: "primary" as const },
    { value: 85, label: "Job Placement Rate", prefix: "", suffix: "%", color: "accent" as const },
    { value: 48, label: "Avg Starting Salary", prefix: "£", suffix: "k", color: "gold" as const },
    { value: 4.8, label: "Student Rating", prefix: "", suffix: "/5", color: "primary" as const }
  ];

  const processSteps = [
    { number: 1, title: "Choose Your Path", description: "Select from our proven courses designed for career switchers" },
    { number: 2, title: "Learn by Doing", description: "Build real projects that employers actually want to see" },
    { number: 3, title: "Get Job-Ready", description: "Receive career support, CV reviews, and interview prep" },
    { number: 4, title: "Land Your Role", description: "Join 300+ graduates now working in their dream careers" }
  ];

  return (
    <PageTransition variant="default">
      <SEO 
        title="Titans Training Group - Professional Training Courses"
        description="Transform your career with practical training courses from Titans Training Group. Learn AML/KYC, Data Analysis, Cybersecurity, and more with hands-on projects. 85% job placement rate."
        keywords="training courses, professional development, career change, AML training, KYC certification, data analysis courses, cybersecurity training, compliance training, tech training"
        structuredData={organizationSchema}
      />
      <PageLayout intensity3D="subtle" show3D={true}>
        
        <ExitIntentPopup />
        <SocialProofNotifications />
        <CourseFinder isOpen={showCourseFinder} onClose={() => setShowCourseFinder(false)} />
        <LeadMagnetModal isOpen={showLeadMagnet} onClose={() => setShowLeadMagnet(false)} />
        <ErrorBoundary fallback={null}>
          <AICourseAdvisor />
        </ErrorBoundary>
        
        <HeroSection />

        <section className="py-16 px-4 bg-background/80 backdrop-blur-sm relative">
          <div className="container mx-auto">
            <LazyInfographic 
              component={StatsInfographic}
              componentProps={{ stats: statsData, columns: 4 }}
            />
          </div>
        </section>
        
        <section className="py-20 md:py-28 px-4 bg-secondary/50 backdrop-blur-sm relative overflow-hidden">
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
        
        <CompanyLogosCarousel />
        
        <UpcomingEvents />
        
        <div id="how-it-works" className="bg-background/80 backdrop-blur-sm py-16">
          <LazyInfographic
            component={ProcessInfographic}
            componentProps={{ title: "Your Journey to a New Career", steps: processSteps }}
          />
        </div>
        
        <div id="success-stories">
          <SuccessStoriesSection />
        </div>
        
        <ToolsCarousel />
        
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
        <ScrollToTop />
        <KeyboardShortcutsHelper />
      </PageLayout>
    </PageTransition>
  );
};

export default Index;
