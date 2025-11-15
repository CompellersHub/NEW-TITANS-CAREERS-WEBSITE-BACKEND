import { PageTransition } from "@/components/PageTransition";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowRight, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getCourseConfig } from "@/lib/course-config";

const Events = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .in("status", ["upcoming", "ongoing"])
        .order("start_date", { ascending: true })
        .limit(20);

      if (selectedCourse) {
        query = query.eq("course_slug", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const courses = ["aml-kyc", "crypto-compliance", "data-privacy", "data-analysis", "cybersecurity", "business-analysis", "digital-marketing"];

  const getNextTwoCohorts = (courseSlug: string) => {
    return events?.filter(e => e.course_slug === courseSlug && e.event_type === "cohort").slice(0, 2) || [];
  };

  return (
    <PageTransition>
      <SEO
        title="Upcoming Events & Cohort Schedule | Titans Careers"
        description="Join our next cohort intake. 2 cohorts every month with flexible scheduling. View upcoming masterclass events and workshop sessions."
        keywords="training events, cohort schedule, masterclass, workshops, online training, professional development"
      />
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-24 px-4 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 bg-gradient-overlay opacity-50" />
          <div className="absolute top-20 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
              <span className="text-accent font-bold text-sm tracking-wide uppercase">
                Professional Training Series
              </span>
            </div>
            
            <h1 className="font-kanit font-bold text-white mb-6" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
              Upcoming Masterclass Events
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8 leading-relaxed">
              Intensive masterclasses designed to maximize your professional growth and industry expertise
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
                <a href="#cohorts">View Cohort Schedule</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link to="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 px-4 bg-secondary/30">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by course:</span>
              <Button
                variant={selectedCourse === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCourse(null)}
              >
                All Courses
              </Button>
              {courses.map((course) => {
                const config = getCourseConfig(course);
                return (
                  <Button
                    key={course}
                    variant={selectedCourse === course ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {config?.shortName || course}
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cohort Schedule Section */}
        <section id="cohorts" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-kanit font-bold text-primary mb-4" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                Next 2 Cohort Intakes
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We run 2 cohorts every month. Secure your spot in the next available intake.
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {courses.map((courseSlug) => {
                  const cohorts = getNextTwoCohorts(courseSlug);
                  if (cohorts.length === 0) return null;

                  const config = getCourseConfig(courseSlug);

                  return (
                    <div key={courseSlug}>
                      <h3 className="font-kanit font-bold text-2xl text-primary mb-6">
                        {config?.displayName || courseSlug}
                      </h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        {cohorts.map((event) => (
                          <Card
                            key={event.id}
                            className="group p-6 hover:shadow-xl transition-all duration-300 border-border bg-card relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-accent opacity-10 rounded-bl-full" />
                            
                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <Badge className="bg-accent/10 text-accent border-accent/20">
                                  Cohort {event.cohort_number}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {event.status}
                                </Badge>
                              </div>

                              <h4 className="font-kanit font-bold text-xl text-primary mb-4">
                                {event.title}
                              </h4>

                              <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4 text-accent" />
                                  <span>Starts: {format(new Date(event.start_date), "MMMM d, yyyy")}</span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4 text-accent" />
                                  <span>8 weeks • Weekends</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 text-accent" />
                                  <span className="capitalize">{event.location}</span>
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button className="flex-1" asChild>
                                  <Link to={`/course/${event.course_slug}`}>
                                    Enroll Now <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                  <Link to={`/course/${event.course_slug}`}>Details</Link>
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-overlay opacity-50" />
          <div className="container mx-auto text-center relative z-10">
            <h2 className="font-kanit font-bold text-white mb-6" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
              Don't Miss the Next Cohort
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Limited spots available. Secure your place in our next intake today.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90" asChild>
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Events;
