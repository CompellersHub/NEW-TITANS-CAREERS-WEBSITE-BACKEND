import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

export const CTA = () => {
  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-tc-navy to-tc-navy/95 text-white relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tc-amber/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tc-gold/5 rounded-full blur-[120px]" />
      
      <div className="container max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-kanit font-bold tracking-tight leading-tight text-primary-foreground">
            Ready to Change Your Career?
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-sans">
            Join 300+ professionals who've upgraded their careers with Titans Careers training and 12 months of support.
          </p>

          {/* Benefits line with amber dots */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-white text-sm leading-snug font-sans">
            <span>8–16 week live cohorts</span>
            <div className="w-1.5 h-1.5 bg-tc-amber rounded-full" />
            <span>12 months career support</span>
            <div className="w-1.5 h-1.5 bg-tc-amber rounded-full" />
            <span>Flexible Payl8r instalments (3–12 months)</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              variant="default"
              className="text-base shadow-amber-glow hover:scale-[1.02] transition-all"
              asChild
            >
              <a 
                href="https://wa.me/447539434403"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTA('WhatsApp CTA', 'footer_section', 'whatsapp_click')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp: +44 7539 434403
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="outlineWhite"
              className="text-base"
              asChild
            >
              <a 
                href="mailto:info@titanscareers.com"
                onClick={() => trackCTA('Email CTA', 'footer_section', 'email_click')}
              >
                <Mail className="w-5 h-5 mr-2" />
                info@titanscareers.com
              </a>
            </Button>
          </div>
          
          <div className="pt-3">
            <p className="text-sm text-primary-foreground leading-snug">
              Contact us today to discuss your goals in AML/KYC, Data, Business Analysis, Cybersecurity and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
