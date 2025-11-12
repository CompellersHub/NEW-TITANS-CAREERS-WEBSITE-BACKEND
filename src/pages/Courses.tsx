import { CourseGrid } from "@/components/courses/CourseGrid";
import { courses } from "@/data/courses";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Courses() {
  const coursesArray = Object.values(courses);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Professional Courses</h1>
          <p className="text-xl text-muted-foreground">
            Transform your career with industry-leading training programs designed by experts
          </p>
        </div>
        <CourseGrid courses={coursesArray} />
      </div>
      <Footer />
    </div>
  );
}
