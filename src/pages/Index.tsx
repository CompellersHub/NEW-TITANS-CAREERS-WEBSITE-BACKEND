import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
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
            <div className="inline-block mb-4 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <span className="text-accent font-bold text-sm tracking-wide uppercase">
                Professional Training
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Our Flagship Courses
            </h2>
            <p className="text-center text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
              Start your career transformation today with our industry-leading programs
            </p>
          </div>
          <CourseGrid courses={featuredCourses} />
          <div className="text-center mt-12 animate-slide-up">
            <Link to="/courses">
              <Button size="lg" variant="default">
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
      
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
