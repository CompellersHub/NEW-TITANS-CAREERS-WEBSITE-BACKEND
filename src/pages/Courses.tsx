import { CourseGrid } from "@/components/courses/CourseGrid";
import { courses } from "@/data/courses";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Courses() {
  const coursesArray = Object.values(courses);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-32 px-4">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/20">
            <span className="text-accent font-bold text-sm tracking-wide uppercase">
              Transform Your Career
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Professional Courses
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Transform your career with industry-leading training programs designed by experts
          </p>
        </div>
        <CourseGrid courses={coursesArray} />
      </div>
      <Footer />
    </div>
  );
}
