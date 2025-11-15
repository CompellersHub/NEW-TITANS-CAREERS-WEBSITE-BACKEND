import { Card, CardContent } from "@/components/ui/card";
import { X, Check } from "lucide-react";

const pains = [
  "Stuck in low-paying jobs with no growth",
  "Constant rejection from employers",
  "No UK experience on your CV",
  "Confused about which career path to take"
];

const transformations = [
  "Land remote, high-paying professional roles",
  "Build a standout CV & LinkedIn profile",
  "Gain practical experience employers value",
  "Clear career path with expert mentoring"
];

export const PainTransformationSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="container px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-kanit font-bold text-primary mb-4" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
            From Frustrated to Fulfilled
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We understand your struggles. Here's how we help you transform your career.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Pain Points */}
          <Card className="border-2 border-destructive/20 hover:border-destructive/40 transition-all hover:shadow-lg animate-fade-in">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-2xl font-kanit font-bold text-primary">Your Current Struggles</h3>
              </div>
              <ul className="space-y-4">
                {pains.map((pain, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <span className="text-base text-muted-foreground font-sans">{pain}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Transformations */}
          <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all hover:shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Check className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-kanit font-bold text-primary">Your New Reality</h3>
              </div>
              <ul className="space-y-4">
                {transformations.map((transformation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-base text-muted-foreground font-sans">{transformation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
