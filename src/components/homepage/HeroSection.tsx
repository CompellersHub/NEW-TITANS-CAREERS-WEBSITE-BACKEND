import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-tc-light-grey/20 min-h-[90vh] flex items-center">
      {/* Subtle accent overlays for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-tc-amber/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] bg-tc-gold/[0.02] rounded-full blur-[100px]" />
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] z-10" />
      
      <div className="container px-4 py-20 md:py-28 relative z-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tc-amber/[0.1] rounded-full border border-tc-amber/20 shadow-sm">
              <span className="text-tc-navy font-sans font-bold text-sm tracking-wide">
                Practical training. Real careers.
              </span>
            </div>
            
            {/* H1 - Kanit, bold, 28-48px responsive */}
            <h1 className="font-kanit font-bold text-tc-navy leading-tight" style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
              Upgrade Your Career with Titans Careers
            </h1>
            
            {/* Body text - Open Sans, 16px, dark grey */}
            <p className="font-sans text-base leading-relaxed text-tc-dark-grey max-w-xl">
              Learn in-demand skills in AML/KYC, Data Analysis, Business Analysis, Cybersecurity, Digital Marketing, Data Privacy and Crypto. No UK experience needed. Get CPD-accredited training and 12 months of career support.
            </p>
            
            {/* CTA Button - single primary */}
            <div className="space-y-4 pt-4">
              <Button 
                size="lg" 
                className="font-sans text-base font-bold bg-tc-amber hover:bg-tc-amber/90 text-white shadow-lg hover:shadow-xl transition-all"
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
              
              {/* Subtext under button */}
              <p className="text-sm text-tc-mid-grey font-sans">
                No credit card required
              </p>
            </div>
            
            {/* Benefits row with amber dots */}
            <div className="flex flex-wrap gap-6 pt-6 text-sm text-tc-navy">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tc-amber rounded-full" />
                <span className="font-sans font-medium">CPD Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tc-amber rounded-full" />
                <span className="font-sans font-medium">Practical Projects & Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tc-amber rounded-full" />
                <span className="font-sans font-medium">12 Months Career Support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-tc-amber rounded-full" />
                <span className="font-sans font-medium">300+ Career Switchers</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Stats Card */}
          <div className="flex justify-center md:justify-end animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-tc-light-grey/50 max-w-sm w-full">
              <div className="space-y-6 text-center">
                <div>
                  <div className="text-6xl font-kanit font-bold text-tc-navy mb-2">
                    300+
                  </div>
                  <p className="text-tc-mid-grey font-sans font-medium">
                    Career Switchers Trained
                  </p>
                </div>
                
                <div className="border-t border-tc-light-grey pt-6">
                  <div className="flex justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-tc-gold text-tc-gold" 
                      />
                    ))}
                  </div>
                  <p className="text-tc-mid-grey font-sans">
                    4.9 Average Rating
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
