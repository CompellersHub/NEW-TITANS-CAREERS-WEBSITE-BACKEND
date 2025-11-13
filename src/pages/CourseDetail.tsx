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

  // Simulate loading state for data fetching
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

  // Track course view
  useEffect(() => {
    if (course) {
      trackCourseView(course.slug, course.title);
    }
  }, [course, trackCourseView]);

  if (isLoading) {
    return (
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
