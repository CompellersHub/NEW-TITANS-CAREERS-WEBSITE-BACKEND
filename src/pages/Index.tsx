import { Navbar } from "@/components/Navbar";
import { EmotionalHeroSection } from "@/components/homepage/EmotionalHeroSection";
import { SkillsCarousel } from "@/components/homepage/SkillsCarousel";
import { SuccessStoriesSection } from "@/components/homepage/SuccessStoriesSection";
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
      <EmotionalHeroSection />
      
      <section className="py-16 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">
            Featured Courses
          </h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Start your career transformation today
          </p>
          <CourseGrid courses={featuredCourses} />
          <div className="text-center mt-8">
            <Link to="/courses">
              <Button size="lg">View All Courses</Button>
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
