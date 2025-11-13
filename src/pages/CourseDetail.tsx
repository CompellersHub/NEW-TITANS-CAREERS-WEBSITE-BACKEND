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
import { PageTransition } from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, BookOpen, Award, Users, CheckCircle } from "lucide-react";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";

export default function CourseDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const coursesArray = Object.values(courses);
  const course = coursesArray.find(c => c.slug === slug);
  const { trackCourseView } = useBehaviorTracking();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success("Payment successful! Check your email for access instructions.");
    }
    if (searchParams.get('canceled') === 'true') {
      toast.error("Payment canceled. Feel free to try again when ready.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (course) {
      trackCourseView(course.slug, course.title);
    }
  }, [course, trackCourseView]);

  if (isLoading) {
    return (
      <PageTransition variant="slideUp">
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto py-16 px-4">
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div className="flex flex-wrap gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-32" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  if (!course) {
    return (
      <PageTransition variant="slideUp">
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="container mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Course not found</h1>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </div>
          <Footer />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp">
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
                <h2 className="text-2xl font-kanit font-bold mb-4 text-foreground">Course Overview</h2>
                <p className="font-sans text-muted-foreground leading-relaxed">{course.description}</p>
              </div>
              
              <div>
                <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">What You'll Learn</h2>
                <EventDetailAccordion items={course.modules} />
              </div>
              
              <div>
                <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">Skills You'll Master</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {course.skills.map((skill, index) => (
                    <SkillLogo key={index} name={skill} />
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">Course Statistics</h2>
                <StatisticsOverview 
                  placementRate={course.placementRate}
                  averageSalary={course.averageSalary}
                  rating={course.rating}
                  students={course.students}
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">Who This Course is For</h2>
                <ul className="space-y-3 font-sans text-muted-foreground">
                  {course.suitableFor.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                    Lifetime access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Certificate of completion
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Career support
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
    </PageTransition>
  );
}
