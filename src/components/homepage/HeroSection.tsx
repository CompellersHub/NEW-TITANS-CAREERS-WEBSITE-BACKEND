import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Sparkles, Award, Target, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-tc-navy/5 via-white to-amber-50/30 min-h-[90vh] flex items-center">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-tc-amber/10 to-tc-gold/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tl from-tc-navy/5 to-tc-amber/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Floating particles */}
        <div className="absolute top-20 left-[10%] w-2 h-2 bg-tc-amber/30 rounded-full animate-float" />
        <div className="absolute top-40 right-[15%] w-3 h-3 bg-tc-gold/20 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-[20%] w-2 h-2 bg-tc-amber/25 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] right-[25%] w-2 h-2 bg-tc-gold/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
      </div>
      
      {/* Enhanced grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] z-10" />
      
      <div className="container px-4 py-20 md:py-28 relative z-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Enhanced Tagline Badge with icon */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tc-amber/15 to-tc-gold/10 rounded-full border-2 border-tc-amber/30 shadow-lg backdrop-blur-sm animate-fade-in hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-tc-amber" />
              <span className="text-tc-navy font-sans font-bold text-sm tracking-wide">
                Practical training. Real careers.
              </span>
            </div>
            
            {/* Enhanced H1 with gradient text */}
            <h1 className="font-kanit font-bold leading-[1.1] animate-fade-in" style={{ fontSize: 'clamp(32px, 6vw, 64px)' }}>
              <span className="bg-gradient-to-r from-tc-navy via-tc-navy to-tc-amber bg-clip-text text-transparent">
                Upgrade Your Career
              </span>
              <br />
              <span className="text-tc-navy">with Titans Careers</span>
            </h1>
            
            {/* Enhanced body text with better line height */}
            <p className="font-sans text-lg leading-relaxed text-tc-dark-grey max-w-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Learn in-demand skills in <span className="font-semibold text-tc-navy">AML/KYC, Data Analysis, Business Analysis, Cybersecurity, Digital Marketing, Data Privacy</span> and <span className="font-semibold text-tc-navy">Crypto</span>. No UK experience needed. Get CPD-accredited training and 12 months of career support.
            </p>
            
            {/* Enhanced CTA Button with glow effect */}
            <div className="space-y-4 pt-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                className="font-sans text-base font-bold bg-gradient-to-r from-tc-amber to-tc-gold hover:from-tc-gold hover:to-tc-amber text-white shadow-2xl hover:shadow-tc-amber/50 transition-all hover:scale-105 group relative overflow-hidden px-8 py-6"
                asChild
              >
                <a 
                  href="https://wa.me/447539434403"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10"
                >
                  <span className="relative z-10">Join Free Live Session</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </a>
              </Button>
              
              {/* Enhanced subtext with icon */}
              <div className="flex items-center gap-2 text-sm text-tc-mid-grey font-sans">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required • Start learning today</span>
              </div>
            </div>
            
            {/* Enhanced benefits with icons and cards */}
            <div className="grid grid-cols-2 gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-tc-light-grey/50 hover:shadow-md hover:scale-105 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-tc-amber/20 to-tc-gold/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-tc-amber" />
                </div>
                <span className="font-sans font-semibold text-sm text-tc-navy">CPD Accredited</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-tc-light-grey/50 hover:shadow-md hover:scale-105 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-tc-amber/20 to-tc-gold/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-tc-amber" />
                </div>
                <span className="font-sans font-semibold text-sm text-tc-navy">Practical Tools</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-tc-light-grey/50 hover:shadow-md hover:scale-105 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-tc-amber/20 to-tc-gold/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-tc-amber" />
                </div>
                <span className="font-sans font-semibold text-sm text-tc-navy">12M Support</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-tc-light-grey/50 hover:shadow-md hover:scale-105 transition-all group">
                <div className="w-10 h-10 bg-gradient-to-br from-tc-amber/20 to-tc-gold/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-tc-amber" />
                </div>
                <span className="font-sans font-semibold text-sm text-tc-navy">300+ Trained</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Enhanced 3D Stats Card */}
          <div className="flex justify-center md:justify-end animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative group">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-tc-amber/20 to-tc-gold/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
              
              {/* Main card */}
              <div className="relative bg-gradient-to-br from-white to-amber-50/50 rounded-3xl shadow-2xl p-10 border-2 border-tc-amber/20 max-w-sm w-full backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-tc-amber/10 to-transparent rounded-bl-full" />
                
                <div className="space-y-8 text-center relative z-10">
                  {/* Main stat with gradient */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-tc-amber/10 to-tc-gold/10 rounded-2xl blur-xl" />
                    <div className="relative">
                      <div className="text-7xl font-kanit font-bold bg-gradient-to-r from-tc-navy via-tc-amber to-tc-gold bg-clip-text text-transparent mb-3 animate-pulse">
                        300+
                      </div>
                      <p className="text-tc-navy font-sans font-bold text-lg">
                        Career Switchers Trained
                      </p>
                    </div>
                  </div>
                  
                  {/* Divider with glow */}
                  <div className="relative">
                    <div className="border-t-2 border-gradient-to-r from-transparent via-tc-amber/30 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tc-amber/10 to-transparent blur-sm" />
                  </div>
                  
                  {/* Rating section */}
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1.5">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className="animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s`, animationDuration: '2s' }}
                        >
                          <Star 
                            className="w-6 h-6 fill-tc-gold text-tc-gold drop-shadow-lg" 
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-tc-navy font-sans font-bold text-lg">
                      4.9 Average Rating
                    </p>
                    <p className="text-tc-mid-grey font-sans text-sm">
                      Based on 250+ reviews
                    </p>
                  </div>
                </div>
                
                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-tc-amber via-tc-gold to-tc-amber rounded-b-3xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
