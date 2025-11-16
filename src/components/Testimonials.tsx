import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Head of Talent Acquisition",
    company: "TechCorp Global",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    content: "Titan Careers transformed our hiring process. We reduced time-to-hire by 40% and significantly improved candidate quality. The ROI was clear within the first month.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "VP of People Operations",
    company: "InnovateCo",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    content: "The analytics alone are worth the investment. We finally have visibility into what's working and what's not. Our cost-per-hire dropped by 35% in six months.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Recruitment Marketing Lead",
    company: "StartupX",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    content: "As a small team, we needed tools that would help us compete with bigger companies. Titan Careers leveled the playing field. We're now attracting Fortune 500 quality candidates.",
    rating: 5
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-tc-navy/[0.02] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-50" />
      </div>
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Loved by Recruiters Worldwide
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of companies that have transformed their hiring
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover-lift border border-border/50 shadow-md hover:shadow-xl hover:border-tc-amber/20 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-tc-amber text-tc-amber" />
                  ))}
                </div>
                
                <p className="text-foreground mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
