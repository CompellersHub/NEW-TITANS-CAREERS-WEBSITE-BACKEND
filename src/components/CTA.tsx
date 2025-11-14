import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

export const CTA = () => {
  return (
    <section id="contact" className="py-24 md:py-32 bg-gradient-hero text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join 300+ professionals who've already transformed their careers with Titans Careers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
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
                onClick={() => trackCTA('WhatsApp CTA', 'hero_section', 'whatsapp_click')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp: +44 7539 434403
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="outlineWhite"
              className="text-lg"
              asChild
            >
              <a 
                href="mailto:info@titanscareers.com"
                onClick={() => trackCTA('Email CTA', 'hero_section', 'email_click')}
              >
                <Mail className="w-5 h-5 mr-2" />
                info@titanscareers.com
              </a>
            </Button>
          </div>
          
          <div className="pt-8 space-y-4">
            <p className="text-sm text-white/70">
              Contact us today to discuss your career goals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
