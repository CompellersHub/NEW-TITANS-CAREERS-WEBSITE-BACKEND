import { useParams, useSearchParams } from "react-router-dom";
import { courses } from "@/data/courses";
import { CourseEnrollmentButton } from "@/components/payment/CourseEnrollmentButton";
import { EventDetailAccordion } from "@/components/events/EventDetailAccordion";
import { StatisticsOverview } from "@/components/events/StatisticsOverview";
import { VideoBackground } from "@/components/video/VideoBackground";
import { SkillLogo } from "@/components/homepage/SkillLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, BookOpen, Award, Users, CheckCircle, ExternalLink } from "lucide-react";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";
import { SEO } from "@/components/SEO";
import { generateCourseSchema } from "@/lib/structuredData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LessonList } from "@/components/course/LessonList";
import { CertificateView } from "@/components/course/CertificateView";
import { DiscussionForum } from "@/components/course/DiscussionForum";
import { createAcademySSOLink } from "@/lib/academy-integration";
import { FloatingCourseCTA } from "@/components/course/FloatingCourseCTA";
import { ShareButton } from "@/components/ShareButton";

export default function CourseDetail() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [generatingSSOLink, setGeneratingSSOLink] = useState(false);
  const coursesArray = Object.values(courses);
  const course = coursesArray.find(c => c.slug === slug);
  const { trackCourseView } = useBehaviorTracking();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    checkEnrollmentAndCertificate();
  }, [user, slug]);

  const checkEnrollmentAndCertificate = async () => {
    if (!user || !slug) return;

    try {
      // Check if user is enrolled
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("customer_email", user.email)
        .eq("course_slug", slug)
        .single();

      setIsEnrolled(!!enrollment);

      // Check for certificate
      const { data: cert } = await supabase
        .from("course_certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_slug", slug)
        .single();

      setCertificate(cert);
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

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

  const handleAccessAcademy = async () => {
    if (!user?.email) {
      toast.error("Please log in to access the course");
      return;
    }

    setGeneratingSSOLink(true);
    try {
      const ssoLink = await createAcademySSOLink(user.email);
      window.open(ssoLink, '_blank');
      toast.success("Opening Titans Academy...");
    } catch (error) {
      console.error("Error generating SSO link:", error);
      toast.error("Failed to generate access link. Please try again.");
    } finally {
      setGeneratingSSOLink(false);
    }
  };

  if (isLoading) {
    return (
      <PageTransition variant="slideUp">
        <PageLayout intensity3D="subtle" show3D={true}>
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
        </PageLayout>
      </PageTransition>
    );
  }

  if (!course) {
    return (
      <PageTransition variant="slideUp">
        <PageLayout intensity3D="subtle" show3D={true}>
          <div className="container mx-auto py-16 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Course not found</h1>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </div>
        </PageLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp">
      <SEO 
        title={`${course.title} - Professional Training Course`}
        description={course.description}
        type="product"
        keywords={`${course.title}, ${course.category}, professional training, certification, ${course.tools.join(', ')}`}
        structuredData={generateCourseSchema({
          name: course.title,
          description: course.description,
          price: course.price,
          duration: course.duration
        })}
      />
      <PageLayout intensity3D="subtle" show3D={true}>
        <FloatingCourseCTA courseSlug={course.slug} courseTitle={course.title} />
        
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <VideoBackground
            videoUrl="https://player.vimeo.com/external/example.mp4"
            posterUrl="/placeholder.svg"
            overlay={true}
            overlayOpacity={0.6}
          />
          <div className="relative z-10 text-center text-primary-foreground space-y-4 px-4">
            <Badge className="mb-4 bg-accent/90 text-accent-foreground border-accent/30 font-semibold">
              {course.category}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-kanit font-bold">
              {course.title}
            </h1>
            <p className="text-xl md:text-2xl font-sans max-w-3xl mx-auto">
              {course.tagline}
            </p>
          </div>
        </section>
        
        <div className="container mx-auto py-16 px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <Badge className="mb-4 bg-tc-amber/10 text-tc-amber border-tc-amber/30 font-semibold">{course.category}</Badge>
                <h1 className="text-4xl md:text-5xl font-kanit font-bold mb-4 text-tc-navy">{course.title}</h1>
                <p className="text-xl font-sans text-muted-foreground mb-8 leading-relaxed">{course.tagline}</p>
                
                <div className="flex flex-wrap gap-6 mb-8">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-tc-amber" />
                    <span className="text-sm font-medium">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-tc-amber" />
                    <span className="text-sm font-medium">{course.projectCount} Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-tc-amber" />
                    <span className="text-sm font-medium">Certificate Included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-tc-amber" />
                    <span className="text-sm font-medium">Expert Instructors</span>
                  </div>
                  
                  <ShareButton 
                    title={course.title}
                    url={window.location.href}
                    description={course.description}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="lessons">Course Content</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="certificate" disabled={!certificate}>
                    Certificate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 mt-8">
                  <div>
                    <h2 className="text-2xl font-kanit font-bold mb-4 text-foreground">Course Overview</h2>
                    <p className="font-sans text-muted-foreground leading-relaxed">{course.description}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">What You'll Learn</h2>
                    <ul className="space-y-3 font-sans text-muted-foreground">
                      {course.overview.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">Tools & Technologies</h2>
                    <div className="flex flex-wrap gap-3">
                      {course.tools.map((tool, index) => (
                        <Badge key={index} variant="secondary">{tool}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-kanit font-bold mb-6 text-foreground">Who This Course is For</h2>
                    <ul className="space-y-3 font-sans text-muted-foreground">
                      {course.whoItsFor.map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="lessons" className="mt-8">
                  <LessonList courseSlug={slug || ""} isEnrolled={isEnrolled} />
                </TabsContent>

                <TabsContent value="discussions" className="mt-8">
                  <DiscussionForum courseSlug={slug || ""} isEnrolled={isEnrolled} />
                </TabsContent>

                <TabsContent value="certificate" className="mt-8">
                  {certificate && <CertificateView certificate={certificate} />}
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-4 p-6 border border-border rounded-lg bg-card shadow-lg space-y-6">
                <div className="text-4xl font-kanit font-bold text-foreground">£{course.price}</div>
                
                {isEnrolled ? (
                  <Button
                    onClick={handleAccessAcademy}
                    disabled={generatingSSOLink}
                    size="lg"
                    className="w-full mb-6"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {generatingSSOLink ? "Generating Link..." : "Access on Titans Academy"}
                  </Button>
                ) : (
                  <CourseEnrollmentButton
                    courseSlug={course.slug}
                    courseTitle={course.title}
                    price={course.price}
                    size="lg"
                    className="w-full mb-6"
                  />
                )}
                
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
      </PageLayout>
    </PageTransition>
  );
}
