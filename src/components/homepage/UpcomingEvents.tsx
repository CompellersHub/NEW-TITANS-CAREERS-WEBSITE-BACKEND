import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { getCourseConfig } from "@/lib/course-config";

export function UpcomingEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .eq("event_type", "cohort")
        .order("start_date", { ascending: true })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !events || events.length === 0) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
            <span className="text-accent font-bold text-sm tracking-wide uppercase">
              Upcoming Cohorts
            </span>
          </div>
          
          <h2 className="font-kanit font-bold text-primary mb-4" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
            Next Intakes Starting Soon
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            2 cohorts every month. Secure your spot in the next available intake.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {events.map((event) => {
            const config = getCourseConfig(event.course_slug);
            
            return (
              <Card
                key={event.id}
                className="group p-6 hover:shadow-xl transition-all duration-300 border-border bg-card relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-accent opacity-10 rounded-bl-full" />
                
                <div className="relative z-10">
                  <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
                    Cohort {event.cohort_number}
                  </Badge>

                  <h3 className="font-kanit font-bold text-lg text-primary mb-2 line-clamp-2">
                    {config?.displayName || event.title}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span>{format(new Date(event.start_date), "MMM d, yyyy")}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>8 weeks</span>
                    </div>
                  </div>

                  <Button className="w-full group/btn" asChild>
                    <Link to={`/course/${event.course_slug}`}>
                      Enroll Now
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
