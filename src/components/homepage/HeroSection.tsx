import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container px-4 py-20 md:py-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Upgrade Your Career with{" "}
              <span className="text-accent">Practical Tech Training</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Learn in-demand skills through hands-on projects. No UK experience needed. 
              Get CPD-accredited certification and ongoing career support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                variant="default"
                className="text-lg"
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
                className="text-lg"
                asChild
              >
                <Link to="/courses">
                  View Courses
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-6 pt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>CPD Accredited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>Practical Projects</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Image/Visual */}
          <div className="relative animate-scale-in">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-accent">300+</div>
                  <div className="text-xl">Career Switchers</div>
                  <div className="flex gap-2 justify-center pt-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 bg-accent rounded-full" />
                    ))}
                  </div>
                  <div className="text-sm text-white/70">4.9/5 Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
