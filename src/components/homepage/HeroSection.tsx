import { Star, Sparkles, Award, Target, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { FreeSessionBookingDialog } from "@/components/FreeSessionBookingDialog";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-white to-tc-navy/[0.02] min-h-[90vh] flex items-center">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute top-0 -left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-tc-amber/8 to-tc-gold/4 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-[1000px] h-[1000px] bg-gradient-to-tl from-tc-navy/3 to-tc-amber/3 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        
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
              <FreeSessionBookingDialog />
              
              {/* Enhanced subtext with icon */}
              <div className="flex items-center gap-2 text-sm text-tc-mid-grey font-sans">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>No credit card required • Start learning today</span>
              </div>
            </div>
            
            {/* Enhanced benefits with premium glassmorphism cards */}
            <div className="grid grid-cols-2 gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative group overflow-hidden p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/40 hover:shadow-[0_16px_48px_-12px_rgba(251,191,36,0.4)] hover:scale-105 hover:border-tc-amber/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-tc-amber/0 to-tc-gold/0 group-hover:from-tc-amber/10 group-hover:to-tc-gold/5 transition-all duration-500 rounded-2xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-tc-amber/20 blur-2xl transition-opacity duration-500 -z-10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-tc-amber to-tc-gold rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sans font-semibold text-sm text-tc-navy">CPD Accredited</span>
                </div>
              </div>
              <div className="relative group overflow-hidden p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/40 hover:shadow-[0_16px_48px_-12px_rgba(30,58,95,0.4)] hover:scale-105 hover:border-tc-navy/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-tc-navy/0 to-tc-blue/0 group-hover:from-tc-navy/10 group-hover:to-tc-blue/5 transition-all duration-500 rounded-2xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-tc-navy/20 blur-2xl transition-opacity duration-500 -z-10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-tc-navy to-tc-blue rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sans font-semibold text-sm text-tc-navy">Practical Tools</span>
                </div>
              </div>
              <div className="relative group overflow-hidden p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/40 hover:shadow-[0_16px_48px_-12px_rgba(34,197,94,0.4)] hover:scale-105 hover:border-green-500/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-600/0 group-hover:from-green-500/10 group-hover:to-emerald-600/5 transition-all duration-500 rounded-2xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-green-500/20 blur-2xl transition-opacity duration-500 -z-10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sans font-semibold text-sm text-tc-navy">12M Support</span>
                </div>
              </div>
              <div className="relative group overflow-hidden p-4 bg-white/60 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.15)] border border-white/40 hover:shadow-[0_16px_48px_-12px_rgba(168,85,247,0.4)] hover:scale-105 hover:border-purple-500/50 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-violet-600/0 group-hover:from-purple-500/10 group-hover:to-violet-600/5 transition-all duration-500 rounded-2xl" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-purple-500/20 blur-2xl transition-opacity duration-500 -z-10" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-sans font-semibold text-sm text-tc-navy">300+ Trained</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Premium Stats Card with Enhanced Effects */}
          <div className="flex justify-center md:justify-end animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative group">
              {/* Multi-layer glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-tc-amber/30 to-tc-gold/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-br from-tc-amber/20 to-tc-gold/20 rounded-3xl blur-3xl group-hover:opacity-80 transition-all duration-500" />
              
              {/* Premium glassmorphism card */}
              <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl shadow-[0_30px_90px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)] p-10 border-2 border-white/60 max-w-sm w-full hover:scale-105 hover:shadow-[0_40px_110px_-20px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-tc-amber/8 via-transparent to-tc-gold/8 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
                
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover:animate-[shimmer-slide_1.5s_ease-in-out]" />
                </div>
                
                {/* Decorative premium corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-tc-amber/15 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-tc-gold/10 to-transparent rounded-tr-full" />
                
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
