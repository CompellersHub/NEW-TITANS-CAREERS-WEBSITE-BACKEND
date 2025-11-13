import { useParams, useSearchParams } from "react-router-dom";
import { courses } from "@/data/courses";
import { StripeCheckoutButton } from "@/components/StripeCheckoutButton";
import { CourseHeroImage } from "@/components/events/CourseHeroImage";
import { EventDetailAccordion } from "@/components/events/EventDetailAccordion";
import { StatisticsOverview } from "@/components/events/StatisticsOverview";
import { SkillLogo } from "@/components/homepage/SkillLogo";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect } from "react";
import { toast } from "sonner";
import { Clock, BookOpen, Award, Users, CheckCircle } from "lucide-react";

export default function CourseDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const coursesArray = Object.values(courses);
  const course = coursesArray.find(c => c.slug === slug);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Payment successful! Check your email for access instructions.");
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error("Payment canceled. Feel free to try again when ready.");
    }
  }, [searchParams]);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Course not found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <CourseHeroImage 
        src="/placeholder.svg"
        alt={course.title}
        title={course.title}
        subtitle={course.tagline}
      />
      
      <div className="container mx-auto py-16 px-4">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <Badge className="mb-4">{course.category}</Badge>
              <h1 className="text-5xl font-kanit font-bold mb-4 text-foreground">{course.title}</h1>
              <p className="text-xl font-sans text-muted-foreground mb-8">{course.tagline}</p>
              
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm">{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-sm">{course.projectCount} Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="text-sm">Certificate Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">Expert Instructors</span>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-kanit font-bold mb-4 text-foreground">Course Overview</h2>
              <p className="text-lg font-sans text-muted-foreground leading-relaxed">{course.description}</p>
            </div>
            
            {course.syllabus && course.syllabus.length > 0 && (
              <div>
                <h2 className="text-3xl font-kanit font-bold mb-6 text-foreground">Curriculum</h2>
                <EventDetailAccordion
                  learningObjectives={course.overview || []}
                  toolsCovered={course.tools || []}
                  prerequisites="No prior experience required"
                  careerRelevance={`This course prepares you for roles such as: ${course.careerOutcomes?.jobTitles.join(', ')}`}
                />
              </div>
            )}
            
            {course.tools && course.tools.length > 0 && (
              <div>
                <h2 className="text-3xl font-kanit font-bold mb-6 text-foreground">Tools & Technologies</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {course.tools.map((tool, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow">
                      <SkillLogo
                        name={tool}
                        logo="🔧"
                        brandColor="#0EA5E9"
                      />
                      <span className="text-sm text-center font-sans font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {course.overview && course.overview.length > 0 && (
              <div>
                <h2 className="text-3xl font-kanit font-bold mb-6 text-foreground">What You'll Learn</h2>
                <ul className="space-y-3">
                  {course.overview.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="font-sans text-muted-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <StatisticsOverview />
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-4 p-6 border border-border rounded-lg bg-card shadow-lg">
              <div className="text-4xl font-kanit font-bold mb-6 text-foreground">£{course.price}</div>
              <StripeCheckoutButton
                courseSlug={course.slug}
                courseTitle={course.title}
                price={course.price}
                size="lg"
                className="w-full mb-6"
              />
              <ul className="space-y-3 text-sm font-sans text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Lifetime access to content
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Certificate of completion
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Career coaching support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Real-world projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Expert instructor access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
