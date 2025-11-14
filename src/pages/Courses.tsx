import { useState, useEffect } from "react";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { courses } from "@/data/courses";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { CoursesPageSkeleton } from "@/components/courses/CoursesPageSkeleton";
import { SEO } from "@/components/SEO";

export default function Courses() {
  const coursesArray = Object.values(courses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CoursesPageSkeleton />;
  }
  
  return (
    <PageTransition variant="slide">
      <SEO 
        title="Professional Training Courses - Transform Your Career"
        description="Browse our complete catalog of professional training courses including AML/KYC, Data Analysis, Cybersecurity, Business Analysis, and more. Industry-leading programs with 85% job placement rate."
        keywords="training courses catalog, professional courses, AML certification, data analysis training, cybersecurity courses, business analyst training, compliance courses"
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-32 px-4">
          <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
              <span className="text-accent font-sans font-bold text-sm tracking-wide uppercase">
                Transform Your Career
              </span>
            </div>
            <h1 className="font-kanit text-5xl md:text-6xl font-bold mb-6 text-primary leading-tight">
              Professional Courses
            </h1>
            <p className="font-sans text-xl text-muted-foreground leading-relaxed">
              Transform your career with industry-leading training programs designed by experts
            </p>
          </div>
          <CourseGrid courses={coursesArray} />
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
