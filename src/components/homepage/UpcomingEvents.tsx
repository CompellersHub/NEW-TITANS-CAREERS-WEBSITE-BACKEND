import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { getCourseConfig } from "@/lib/course-config";
import { getCohortUrgency } from "@/lib/calendar-utils";

export function UpcomingEvents() {
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "cohort")
        .in("status", ["upcoming", "ongoing"]) // Exclude archived and completed
        .gte("start_date", new Date().toISOString()) // Only show future events
        .order("start_date", { ascending: true })
        .limit(20); // Increased to accommodate 2 cohorts per course

      if (error) throw error;
      return data;
    },
  });

  // Group events by course and take first 2 cohorts per course, sorted by urgency
  const events = allEvents?.reduce((acc, event) => {
    const courseEvents = acc.filter(e => e.course_slug === event.course_slug);
    if (courseEvents.length < 2) {
      acc.push(event);
    }
    return acc;
  }, [] as typeof allEvents)
    .sort((a, b) => {
      const urgencyA = getCohortUrgency(a.start_date);
      const urgencyB = getCohortUrgency(b.start_date);
      const urgencyOrder = { urgent: 0, soon: 1, future: 2 };
      return urgencyOrder[urgencyA.level] - urgencyOrder[urgencyB.level];
    })
    .slice(0, 10); // Max 10 events (5 courses × 2 cohorts)

  if (isLoading || !events || events.length === 0) return null;

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-tc-navy/[0.02] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-tc-amber/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-tc-gold/5 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-20 space-y-6 animate-fade-in">
          <Badge className="bg-tc-navy/10 text-tc-navy border-tc-navy/20 font-semibold px-6 py-2 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            UPCOMING COHORTS
          </Badge>
          
          <h2 className="font-kanit text-3xl md:text-4xl lg:text-6xl font-bold text-tc-navy">
            Join Our Next <span className="text-tc-amber">Cohort</span>
          </h2>
          
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            2 cohorts per course. Secure your spot in the next available intake.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {events.map((event) => {
            const config = getCourseConfig(event.course_slug);
            const urgency = getCohortUrgency(event.start_date);
            
            return (
              <Card
                key={event.id}
                className={`group hover-lift p-6 border-2 shadow-lg hover:shadow-2xl transition-all duration-400 bg-card relative overflow-hidden ${
                  urgency.glowEffect ? 'animate-pulse-subtle shadow-amber-200' : ''
                }`}
                style={{
                  borderColor: urgency.borderColor,
                  backgroundColor: urgency.level === 'urgent' ? 'hsl(43 100% 96%)' : 'white'
                }}
              >
                {urgency.level === 'urgent' && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20">
                    🔥 {urgency.daysUntil} days
                  </div>
                )}
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-tc-amber/10 to-tc-gold/5 rounded-bl-full" />
                
                <div className="relative z-10">
                  <Badge 
                    className={`mb-4 font-semibold ${
                      urgency.level === 'urgent' 
                        ? 'bg-amber-500 text-white border-amber-600' 
                        : 'bg-tc-amber/10 text-tc-amber border-tc-amber/30'
                    }`}
                  >
                    {urgency.message}
                  </Badge>

                  <h3 className="font-kanit font-bold text-lg text-tc-navy mb-2 line-clamp-2 group-hover:text-tc-amber transition-colors duration-300">
                    {config?.displayName || event.title}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-tc-amber" />
                      <span>{format(new Date(event.start_date), "MMM d, yyyy")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-tc-amber" />
                      <span>{(event.metadata as any)?.duration_weeks || 8} weeks • {(event.metadata as any)?.session_time || "Evening session"}</span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full group/btn ${
                      urgency.level === 'urgent' ? 'animate-pulse-subtle' : ''
                    }`}
                    asChild
                  >
                    <Link to={`/course/${event.course_slug}`}>
                      {urgency.level === 'urgent' ? 'Enroll Now!' : 'Enroll Now'}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/events">
              View Full Schedule <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
