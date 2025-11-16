import { Button } from "@/components/ui/button";
import { MessageCircle, Mail } from "lucide-react";
import { trackCTA } from "@/lib/analytics";

export const CTA = () => {
  return (
    <section className="py-6 md:py-8 bg-tc-navy text-white relative overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      <div className="container px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-4 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            Ready to Change Your Career?
          </h2>
          
          <p className="text-base md:text-lg text-tc-light-grey max-w-2xl mx-auto leading-snug">
            Join 300+ professionals who've upgraded their careers with Titans Careers training and 12 months of support.
          </p>

          {/* Benefits line with amber dots */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-tc-light-grey text-sm leading-snug">
            <span>8–16 week live cohorts</span>
            <div className="w-1.5 h-1.5 bg-tc-amber rounded-full" />
            <span>12 months career support</span>
            <div className="w-1.5 h-1.5 bg-tc-amber rounded-full" />
            <span>Flexible Payl8r instalments (3–12 months)</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-3">
            <Button 
              size="lg" 
              className="text-lg bg-tc-amber hover:bg-tc-amber/90 text-white shadow-lg hover:shadow-xl transition-all"
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
              variant="outline"
              className="text-lg bg-transparent border-2 border-white text-white hover:bg-white hover:text-tc-navy transition-all"
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
            <p className="text-sm text-tc-light-grey leading-snug">
              Contact us today to discuss your goals in AML/KYC, Data, Business Analysis, Cybersecurity and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
