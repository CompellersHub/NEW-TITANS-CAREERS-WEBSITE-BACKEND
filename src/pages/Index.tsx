import { Navbar } from "@/components/Navbar";
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

const Index = () => {
  const coursesArray = Object.values(courses);
  const featuredCourses = coursesArray.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      
      {/* Featured Courses Section */}
      <section className="py-20 md:py-28 px-4 bg-secondary relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            {/* Badge */}
            <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
              <span className="text-accent font-bold text-sm tracking-wide uppercase">
                Professional Training
              </span>
            </div>
            
            {/* H2 - Kanit, semi-bold, 24-36px responsive */}
            <h2 className="font-kanit font-semibold text-primary mb-6" style={{ fontSize: 'clamp(24px, 4vw, 36px)' }}>
              Our Flagship Courses
            </h2>
            
            {/* Body text - Open Sans, 16px, Dark Grey */}
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start your career transformation today with our industry-leading programs
            </p>
          </div>
          
          <CourseGrid courses={featuredCourses} />
          
          <div className="text-center mt-12 animate-slide-up">
            <Link to="/courses">
              <Button size="lg" variant="default" className="font-bold">
                View All Courses
              </Button>
            </Link>
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
      
      <NewsletterSection />
      
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
