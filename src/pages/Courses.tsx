import { CourseGrid } from "@/components/courses/CourseGrid";
import { courses } from "@/data/courses";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

export default function Courses() {
  const coursesArray = Object.values(courses);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-20 animate-fade-in">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-6 py-3 text-sm font-bold tracking-wider">
            TRANSFORM YOUR CAREER
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
            Professional Courses
          </h1>
          <p className="text-2xl text-muted-foreground leading-relaxed font-medium">
            Transform your career with industry-leading training programs designed by experts
          </p>
        </div>
        <CourseGrid courses={coursesArray} />
      </div>
      <Footer />
    </div>
  );
}
