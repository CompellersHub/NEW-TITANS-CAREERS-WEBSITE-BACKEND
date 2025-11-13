import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-primary min-h-[90vh] flex items-center">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: `linear-gradient(
            135deg,
            hsl(213 69% 13%) 0%,
            hsl(213 69% 10%) 25%,
            hsl(213 69% 13%) 50%,
            hsl(220 69% 15%) 75%,
            hsl(213 69% 13%) 100%
          )`,
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Subtle accent overlay */}
      <div 
        className="absolute inset-0 opacity-20 animate-gradient-flow"
        style={{
          background: `radial-gradient(
            ellipse at top left,
            hsl(43 100% 50% / 0.15) 0%,
            transparent 50%
          ), radial-gradient(
            ellipse at bottom right,
            hsl(45 67% 47% / 0.1) 0%,
            transparent 50%
          )`,
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-10" />
      
      <div className="container px-4 py-20 md:py-28 relative z-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/30">
              <span className="text-accent font-bold text-sm tracking-wide">
                Practical training. Real careers.
              </span>
            </div>
            
            {/* H1 - Kanit, bold, 28-48px responsive */}
            <h1 className="font-kanit font-bold text-white leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
              Upgrade Your Career with{" "}
              <span className="text-accent">Practical Tech Training</span>
            </h1>
            
            {/* Body text - Open Sans, 16px */}
            <p className="text-base leading-relaxed text-white/90 max-w-xl">
              Learn in-demand skills through hands-on projects. No UK experience needed. 
              Get CPD-accredited certification and ongoing career support.
            </p>
            
            {/* CTA Buttons - large touch targets */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                variant="default"
                className="text-base font-bold"
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
                className="text-base font-bold"
                asChild
              >
                <Link to="/courses">
                  View Courses
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 pt-6 text-sm text-white">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-sans">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-sans">CPD Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="font-sans">Practical Projects</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats Card */}
          <div className="relative animate-scale-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-[0_16px_48px_-8px_hsl(var(--primary)/0.3)]">
              <div className="aspect-video bg-white/5 rounded-xl flex items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <div className="text-6xl md:text-7xl font-kanit font-bold text-accent">300+</div>
                  <div className="text-xl md:text-2xl font-kanit font-semibold text-white">Career Switchers</div>
                  <div className="flex gap-2 justify-center pt-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-accent rounded-full" />
                    ))}
                  </div>
                  <div className="text-sm text-white/80 font-sans">4.9/5 Average Rating</div>
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
