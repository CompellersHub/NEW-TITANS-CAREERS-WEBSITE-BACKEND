import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-white min-h-[90vh] flex items-center">
      {/* Pure white background with glossy effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white via-white to-secondary"
      />
      
      {/* Subtle accent overlays for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-gold/[0.03] rounded-full blur-[100px]" />
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] z-10" />
      
      <div className="container px-4 py-20 md:py-28 relative z-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/[0.08] rounded-full border border-accent/20 shadow-sm">
              <span className="text-accent font-sans font-bold text-sm tracking-wide">
                Practical training. Real careers.
              </span>
            </div>
            
            {/* H1 - Kanit, bold, 28-48px responsive */}
            <h1 className="font-kanit font-bold text-primary leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
              Upgrade Your Career with{" "}
              <span className="text-accent">Practical Tech Training</span>
            </h1>
            
            {/* Body text - Open Sans, 16px */}
            <p className="font-sans text-base leading-relaxed text-primary/80 max-w-xl">
              Learn in-demand skills through hands-on projects. No UK experience needed. 
              Get CPD-accredited certification and ongoing career support.
            </p>
            
            {/* CTA Buttons - large touch targets */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                variant="default"
                className="font-sans text-base font-bold"
                asChild
              >
                <a 
                  href="https://wa.me/447539434403"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Free Live Session
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outlineWhite"
                className="font-sans text-base font-bold"
                asChild
              >
                <Link to="/courses">
                  View Courses
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-6 text-sm text-primary/70">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-glow" />
                <span className="font-sans">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-glow" />
                <span className="font-sans">CPD Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-glow" />
                <span className="font-sans">Practical Projects</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats Card */}
          <div className="relative animate-scale-in">
            <div className="bg-white border border-border rounded-2xl p-10 shadow-lg hover:shadow-xl transition-shadow">
              <div className="space-y-6">
                {/* Stat */}
                <div>
                  <h3 className="text-6xl font-kanit font-bold text-primary">
                    300<span className="text-accent">+</span>
                  </h3>
                  <p className="font-sans text-lg text-primary/70 mt-2">
                    Career Switchers
                  </p>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-6 h-6 text-accent">⭐</div>
                    ))}
                  </div>
                  <span className="font-sans text-sm text-primary/60 ml-2">
                    4.9 Average Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};
