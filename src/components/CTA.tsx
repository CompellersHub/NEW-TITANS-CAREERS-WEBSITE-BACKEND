import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const CTA = () => {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-32 bg-gradient-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Animated glow orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in">
          <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-6 py-3 text-sm font-bold tracking-wider backdrop-blur-sm">
            LIMITED TIME OFFER
          </Badge>
          
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            Ready to Transform <br />
            <span className="bg-gradient-to-r from-white via-accent-light to-white bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
              Your Career?
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium">
            Join 300+ professionals who've already transformed their careers with Titan Careers
          </p>
          
          <div className="flex flex-wrap gap-8 justify-center pt-6">
            <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-full px-6 py-3 backdrop-blur-md border border-primary-foreground/20">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold text-lg">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-full px-6 py-3 backdrop-blur-md border border-primary-foreground/20">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold text-lg">Start immediately</span>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 rounded-full px-6 py-3 backdrop-blur-md border border-primary-foreground/20">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold text-lg">Full support included</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button 
              size="lg" 
              className="text-lg px-12 py-8 bg-primary-foreground text-primary shadow-2xl hover:shadow-glow-lg transition-all duration-300 hover:scale-110 font-bold text-xl rounded-2xl animate-glow"
              onClick={scrollToContact}
            >
              Start Your Journey
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-12 py-8 bg-transparent border-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 transition-all duration-300 hover:scale-105 font-bold text-xl rounded-2xl backdrop-blur-sm"
            >
              Talk to an Advisor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
