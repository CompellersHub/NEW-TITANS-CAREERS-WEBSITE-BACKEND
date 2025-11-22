import { PageTransition } from "@/components/PageTransition";
import { PageLayout } from "@/components/layouts/PageLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, ArrowRight, Filter, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getCourseConfig } from "@/lib/course-config";
import { generateGoogleCalendarLink, downloadICalendar, getCourseColor, getCohortUrgency } from "@/lib/calendar-utils";

const Events = () => {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const { data: events, isLoading } = useQuery({
    // Bump query key version to force fresh fetch of updated cohort dates
    queryKey: ["events-v2", selectedCourse],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .in("status", ["upcoming", "ongoing"]) // Exclude archived and completed
        .gte("start_date", new Date().toISOString()) // Only show future events
        .order("start_date", { ascending: true })
        .limit(50); // Increased to ensure all 7 courses × 2 cohorts + buffer

      if (selectedCourse) {
        query = query.eq("course_slug", selectedCourse);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const courses = ["aml-kyc", "crypto-compliance", "data-privacy", "data-analysis", "cybersecurity", "business-analysis", "digital-marketing"];

  const getNextCohort = (courseSlug: string) => {
    const cohorts = events?.filter(e => e.course_slug === courseSlug && e.event_type === "cohort").slice(0, 2) || [];
    // Sort by urgency: urgent first, then soon, then future
    return cohorts.sort((a, b) => {
      const urgencyA = getCohortUrgency(a.start_date);
      const urgencyB = getCohortUrgency(b.start_date);
      const urgencyOrder = { urgent: 0, soon: 1, future: 2 };
      return urgencyOrder[urgencyA.level] - urgencyOrder[urgencyB.level];
    });
  };

  return (
    <PageTransition>
      <SEO
        title="Upcoming Events & Cohort Schedule | Titans Careers"
        description="Join our next cohort intake. 1 cohort per month with flexible scheduling. View upcoming masterclass events and workshop sessions."
        keywords="training events, cohort schedule, masterclass, workshops, online training, professional development"
      />
      <PageLayout intensity3D="medium" show3D={true}>

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
                size="sm"
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: selectedCourse === null ? '#0B1F3B' : 'transparent',
                  color: selectedCourse === null ? '#FFFFFF' : '#0B1F3B',
                  borderColor: '#0B1F3B',
                  borderWidth: '1px',
                  opacity: selectedCourse === null ? 1 : 0.7,
                }}
                className="hover:opacity-100 transition-opacity"
              >
                All Courses
              </Button>
              {courses.map((course) => {
                const config = getCourseConfig(course);
                const isSelected = selectedCourse === course;
                return (
                  <Button
                    key={course}
                    size="sm"
                    onClick={() => setSelectedCourse(course)}
                    style={{
                      background: isSelected ? '#0B1F3B' : 'transparent',
                      color: isSelected ? '#FFFFFF' : '#0B1F3B',
                      borderColor: '#0B1F3B',
                      borderWidth: '1px',
                      opacity: isSelected ? 1 : 0.7,
                    }}
                    className="hover:opacity-100 transition-opacity"
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
                Upcoming Cohorts
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We run 2 cohorts per course. Secure your spot in the next available intake.
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
                  const cohorts = getNextCohort(courseSlug);
                  if (cohorts.length === 0) return null;

                  const config = getCourseConfig(courseSlug);

                  return (
                    <div key={courseSlug}>
                      <h3 className="font-kanit font-bold text-2xl text-primary mb-6">
                        {config?.displayName || courseSlug}
                      </h3>
                      <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
                        {cohorts.map((event) => {
                          const metadata = event.metadata as Record<string, any> | null;
                          const sessionDay = metadata?.session_day || config?.dayOfWeek || 'Weekends';
                          const sessionTime = metadata?.session_time || '7-9pm UK';
                          const durationWeeks = metadata?.duration_weeks || config?.duration || 8;
                          const CourseIcon = config?.icon;
                          const urgency = getCohortUrgency(event.start_date);
                          
                          return (
                            <Card
                              key={event.id}
                              className={`group p-0 hover:shadow-2xl transition-all duration-300 relative overflow-hidden ${
                                urgency.glowEffect ? 'animate-pulse-subtle shadow-amber-200' : ''
                              }`}
                              style={{ 
                                borderColor: urgency.borderColor,
                                borderWidth: urgency.glowEffect ? '2px' : '1px'
                              }}
                            >
                              {/* Header section with dynamic gradient */}
                              <div 
                                className="h-32 flex items-center justify-center relative"
                                style={{ background: urgency.headerBg }}
                              >
                                {urgency.level === 'urgent' && (
                                  <div className="absolute top-2 right-2">
                                    <Badge className="bg-white text-amber-600 font-bold animate-bounce">
                                      {urgency.daysUntil} days left
                                    </Badge>
                                  </div>
                                )}
                                {CourseIcon && (
                                  <CourseIcon 
                                    className={`w-16 h-16 stroke-[1.5] ${
                                      urgency.level === 'urgent' ? 'text-white' : 'text-[#FFB000]'
                                    }`} 
                                  />
                                )}
                              </div>
                              
                              {/* White content section */}
                              <div className="p-6 bg-white">
                                <div className="flex items-start justify-between mb-3">
                                  <Badge 
                                    style={{ 
                                      background: urgency.badgeBg,
                                      color: urgency.badgeColor,
                                      borderColor: urgency.borderColor,
                                      borderWidth: '1px'
                                    }}
                                    className="font-semibold"
                                  >
                                    {urgency.message} • {format(new Date(event.start_date), "MMM d")}
                                  </Badge>
                                  <Badge 
                                    variant="outline" 
                                    className="capitalize border-muted-foreground/20"
                                  >
                                    {event.status}
                                  </Badge>
                                </div>

                                {urgency.level === 'urgent' && (
                                  <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-200 mb-3">
                                    <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                                    <span className="text-sm font-semibold text-amber-700">
                                      Registration closes in {urgency.daysUntil} days
                                    </span>
                                  </div>
                                )}

                                <h4 className="font-kanit font-bold text-2xl text-foreground mb-2">
                                  {config?.displayName || event.course_slug}
                                </h4>
                                
                                <p className="text-sm text-muted-foreground mb-4">
                                  {event.description}
                                </p>

                                <div className="space-y-2 mb-5">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-[#FFB000]" />
                                    <span>Starts: {format(new Date(event.start_date), "MMM d, yyyy")}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-[#FFB000]" />
                                    <span>{durationWeeks} weeks • {sessionTime} • {sessionDay}s</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4 text-[#FFB000]" />
                                    <span className="capitalize">{event.location}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Button 
                                    className={`w-full font-semibold ${
                                      urgency.level === 'urgent' ? 'animate-pulse-subtle' : ''
                                    }`}
                                    style={{ 
                                      background: urgency.ctaBg,
                                      color: '#0B1F3B'
                                    }}
                                    asChild
                                  >
                                    <Link to={`/course/${event.course_slug}`}>
                                      {urgency.ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                  </Button>
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button 
                                      size="sm"
                                      className="text-xs"
                                      style={{ 
                                        background: '#0B1F3B',
                                        color: '#FFFFFF',
                                      }}
                                      onClick={() => {
                                        const calendarEvent = {
                                          title: event.title,
                                          description: event.description || '',
                                          startDate: new Date(event.start_date),
                                          endDate: new Date(event.end_date || event.start_date),
                                          location: 'Online - Google Meet',
                                          timezone: 'Europe/London',
                                        };
                                        window.open(generateGoogleCalendarLink(calendarEvent), '_blank');
                                      }}
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Google
                                    </Button>
                                    <Button 
                                      size="sm"
                                      className="text-xs"
                                      style={{ 
                                        background: '#0B1F3B',
                                        color: '#FFFFFF',
                                      }}
                                      onClick={() => {
                                        const calendarEvent = {
                                          title: event.title,
                                          description: event.description || '',
                                          startDate: new Date(event.start_date),
                                          endDate: new Date(event.end_date || event.start_date),
                                          location: 'Online - Google Meet',
                                          timezone: 'Europe/London',
                                        };
                                        downloadICalendar(calendarEvent, `${event.course_slug}-cohort-${event.cohort_number}.ics`);
                                      }}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      .ics
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
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

      </PageLayout>
    </PageTransition>
  );
};

export default Events;
