import { Navbar } from "@/components/Navbar";
import { EmotionalHeroSection } from "@/components/homepage/EmotionalHeroSection";
import { SkillsCarousel } from "@/components/homepage/SkillsCarousel";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { courses } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Index = () => {
  const coursesArray = Object.values(courses);
  const featuredCourses = coursesArray.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <EmotionalHeroSection />
      
      <section className="py-24 px-4 bg-gradient-to-br from-secondary/30 via-accent-light/20 to-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-6 py-2 text-sm font-bold tracking-wide">
              PROFESSIONAL TRAINING
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Featured Courses
            </h2>
            <p className="text-center text-muted-foreground mb-4 text-xl max-w-2xl mx-auto leading-relaxed">
              Start your career transformation today with our industry-leading programs
            </p>
          </div>
          <CourseGrid courses={featuredCourses} />
          <div className="text-center mt-12 animate-slide-up">
            <Link to="/courses">
              <Button size="lg" className="text-lg px-10 py-7 bg-gradient-primary shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105 font-bold">
                View All Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <SkillsCarousel />
      <SuccessStoriesSection />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
