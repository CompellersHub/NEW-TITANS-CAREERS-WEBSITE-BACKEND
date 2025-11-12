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
    <section className="py-24 bg-background">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Loved by Recruiters Worldwide
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of companies that have transformed their hiring
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
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
